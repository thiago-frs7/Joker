import { db, garantirBase, type Config, type Evento, type Missao, type Obra, type Passo, type Perfil, type TrofeuGanho } from './db'

/**
 * Os dados vivem no navegador. Isso é rápido e privado, e também significa que
 * limpar o site apaga tudo. O arquivo JSON é o único cofre — e por isso o app
 * cobra um backup a cada 30 dias, com o botão à mão.
 */

export const VERSAO_BACKUP = 1

export interface Backup {
  app: 'almas'
  versao: number
  exportadoEm: number
  perfil: Perfil
  config: Config
  missoes: Missao[]
  passos: Passo[]
  obras: Obra[]
  eventos: Evento[]
  trofeus: TrofeuGanho[]
}

export async function montarBackup(): Promise<Backup> {
  const [perfil, config, missoes, passos, obras, eventos, trofeus] = await Promise.all([
    db.perfil.get(1),
    db.config.get(1),
    db.missoes.toArray(),
    db.passos.toArray(),
    db.obras.toArray(),
    db.eventos.toArray(),
    db.trofeus.toArray(),
  ])
  return {
    app: 'almas',
    versao: VERSAO_BACKUP,
    exportadoEm: Date.now(),
    perfil: perfil!,
    config: config!,
    missoes,
    passos,
    obras,
    eventos,
    trofeus,
  }
}

function carimbo(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export async function exportarArquivo(): Promise<void> {
  const backup = await montarBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `almas-${carimbo()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  await db.perfil.update(1, { ultimoBackup: Date.now() })
}

export interface ResumoImportacao {
  missoes: number
  obras: number
  trofeus: number
  almas: number
  exportadoEm: number
}

export function lerBackup(texto: string): Backup {
  let dados: unknown
  try {
    dados = JSON.parse(texto)
  } catch {
    throw new Error('Esse arquivo não é JSON válido.')
  }
  const b = dados as Partial<Backup>
  if (b?.app !== 'almas' || typeof b.versao !== 'number') {
    throw new Error('Esse JSON não parece um backup do ALMAS.')
  }
  if (b.versao > VERSAO_BACKUP) {
    throw new Error('Esse backup veio de uma versão mais nova do app.')
  }
  if (!b.perfil || !Array.isArray(b.missoes)) {
    throw new Error('O backup está incompleto — falta o perfil ou as missões.')
  }
  return b as Backup
}

export function resumir(b: Backup): ResumoImportacao {
  return {
    missoes: b.missoes.length,
    obras: b.obras?.length ?? 0,
    trofeus: b.trofeus?.length ?? 0,
    almas: b.perfil.almas,
    exportadoEm: b.exportadoEm,
  }
}

/** Substitui tudo. A tela pede confirmação explícita antes de chamar. */
export async function restaurar(b: Backup): Promise<void> {
  await db.transaction(
    'rw',
    [db.perfil, db.config, db.missoes, db.passos, db.obras, db.eventos, db.trofeus],
    async () => {
      await Promise.all([
        db.missoes.clear(),
        db.passos.clear(),
        db.obras.clear(),
        db.eventos.clear(),
        db.trofeus.clear(),
      ])
      await db.perfil.put({ ...b.perfil, id: 1 })
      if (b.config) await db.config.put({ ...b.config, id: 1 })
      if (b.missoes.length) await db.missoes.bulkPut(b.missoes)
      if (b.passos?.length) await db.passos.bulkPut(b.passos)
      if (b.obras?.length) await db.obras.bulkPut(b.obras)
      if (b.eventos?.length) await db.eventos.bulkPut(b.eventos.map(({ id: _, ...e }) => e as Evento))
      if (b.trofeus?.length) await db.trofeus.bulkPut(b.trofeus)
    },
  )
  await garantirBase()
}

export function diasDesde(ms: number): number {
  return Math.floor((Date.now() - ms) / 86_400_000)
}

export function precisaBackup(perfil: Perfil | undefined, limite: number): boolean {
  if (!perfil) return false
  // Só cobra de quem tem o que perder.
  if (perfil.almas < 100) return false
  return diasDesde(perfil.ultimoBackup) >= limite
}
