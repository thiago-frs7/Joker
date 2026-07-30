import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Gera os ícones PNG do PWA sem depender de nenhuma biblioteca gráfica.
 * O desenho é o mesmo do favicon: a brasa dentro do losango.
 *   node scripts/gerar-icones.mjs
 */

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const CRIPTA = [13, 11, 10]
const BRASA = [232, 163, 61]
const BRASA_CLARA = [255, 217, 160]
const BRASA_FUNDA = [140, 78, 26]

const mistura = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, k))))

function pixel(x, y, n) {
  // coordenadas normalizadas em [-1, 1]
  const u = (x / n) * 2 - 1
  const v = (y / n) * 2 - 1
  let cor = CRIPTA

  // clarão de fogueira ao fundo
  const d = Math.hypot(u, v + 0.06)
  cor = mistura(cor, [40, 26, 14], Math.max(0, 0.75 - d) * 0.9)

  // losango (camada)
  const losango = Math.abs(u) + Math.abs(v)
  const borda = 0.78
  const espessura = 0.13
  if (Math.abs(losango - borda) < espessura) {
    const k = 1 - Math.abs(losango - borda) / espessura
    cor = mistura(cor, mistura(BRASA_FUNDA, BRASA, 0.5 + v * -0.5), k)
  }

  // brasa central
  const nucleo = Math.hypot(u, v)
  if (nucleo < 0.36) {
    const k = 1 - nucleo / 0.36
    cor = mistura(cor, mistura(BRASA, BRASA_CLARA, Math.pow(k, 2)), Math.pow(k, 0.55))
  }
  return cor
}

function png(n) {
  const linhas = []
  for (let y = 0; y < n; y++) {
    const linha = Buffer.alloc(1 + n * 3)
    for (let x = 0; x < n; x++) {
      const [r, g, b] = pixel(x + 0.5, y + 0.5, n)
      linha[1 + x * 3] = r
      linha[2 + x * 3] = g
      linha[3 + x * 3] = b
    }
    linhas.push(linha)
  }
  const dados = deflateSync(Buffer.concat(linhas), { level: 9 })

  const crcTabela = Array.from({ length: 256 }, (_, i) => {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
  })
  const crc = (buf) => {
    let c = 0xffffffff
    for (const byte of buf) c = crcTabela[(c ^ byte) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }
  const pedaco = (tipo, corpo) => {
    const tamanho = Buffer.alloc(4)
    tamanho.writeUInt32BE(corpo.length)
    const meio = Buffer.concat([Buffer.from(tipo, 'ascii'), corpo])
    const soma = Buffer.alloc(4)
    soma.writeUInt32BE(crc(meio))
    return Buffer.concat([tamanho, meio, soma])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(n, 0)
  ihdr.writeUInt32BE(n, 4)
  ihdr[8] = 8 // bits
  ihdr[9] = 2 // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pedaco('IHDR', ihdr),
    pedaco('IDAT', dados),
    pedaco('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(resolve(raiz, 'public'), { recursive: true })
for (const n of [192, 512]) {
  writeFileSync(resolve(raiz, `public/icone-${n}.png`), png(n))
  console.log(`public/icone-${n}.png`)
}
