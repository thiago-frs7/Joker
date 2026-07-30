import { db, id, type Missao, type Obra, type Passo, type Perfil, type TipoEvento } from './db'
import { canalCamada, canalGanho, canalTrofeu, tremer } from './pulso'
import {
  GANHO,
  MOMENTUM_GANHO,
  comMultiplicador,
  decairMomentum,
  nivelDeAlmas,
  somarMomentum,
} from '../dominio/progressao'
import { conquistados, type ContextoTrofeu } from '../dominio/trofeus'
import { hoje, palpiteDeAtributo, type Capturado } from '../dominio/captura'
import type { AtributoId, Energia, EstadoObra, TipoObra } from '../dominio/tipos'
import { ORDEM_ENERGIA, TIPO_OBRA } from '../dominio/tipos'

/**
 * Tudo que escreve no banco passa por aqui.
 *
 * O contrato de cada ação: **primeiro o pulso, depois o banco**. A tela reage em
 * milissegundos; a persistência acontece atrás e o `useLiveQuery` reconcilia.
 */

/* ─────────────────────── cache vivo do perfil ─────────────────────────── */

let cache: Perfil | null = null

export function guardarPerfilEmCache(p: Perfil | undefined) {
  if (p) cache = p
}

function nivelAgora(): number {
  return nivelDeAlmas(cache?.almas ?? 0)
}

const DIA = 86_400_000

/* ───────────────────────────── premiar ────────────────────────────────── */

interface Premio {
  base: number
  atributo: AtributoId
  tipo: TipoEvento
  rotulo: string
  ref?: string
  momentum?: number
  origem?: { x: number; y: number }
  /** Mexe nos contadores dentro da mesma transação. */
  contar?: (p: Perfil) => void
}

async function premiar({ base, atributo, tipo, rotulo, ref, momentum = 0, origem, contar }: Premio) {
  const nivel = nivelAgora()
  const almas = base > 0 ? comMultiplicador(base, nivel) : 0

  // 1. Recompensa na cara, imediatamente.
  if (almas > 0) {
    canalGanho.emitir({ almas, atributo, rotulo, origem })
    tremer(10)
  }

  // 2. Só então o banco.
  const agora = Date.now()
  let subiu: number | null = null

  await db.transaction('rw', db.perfil, db.eventos, async () => {
    const p = (await db.perfil.get(1))!
    const antes = nivelDeAlmas(p.almas)
    p.almas += almas
    p.atributos[atributo] = (p.atributos[atributo] ?? 0) + almas
    p.momentum = somarMomentum(decairMomentum(p.momentum, p.momentumEm, agora), momentum)
    p.momentumEm = agora
    contar?.(p)
    const depois = nivelDeAlmas(p.almas)
    if (depois > antes) subiu = depois
    await db.perfil.put(p)
    cache = p
    await db.eventos.add({ ts: agora, tipo, almas, atributo, ref, rotulo, nivel: depois })
  })

  if (subiu !== null) {
    canalCamada.emitir({ nivel: subiu })
    tremer([0, 30, 60, 40])
  }

  await conferirTrofeus()
}

/** Registra algo que aconteceu sem valer Almas (adiar, mudar foco). */
async function anotar(tipo: TipoEvento, rotulo: string, ref?: string, contar?: (p: Perfil) => void) {
  const agora = Date.now()
  await db.transaction('rw', db.perfil, db.eventos, async () => {
    const p = (await db.perfil.get(1))!
    contar?.(p)
    await db.perfil.put(p)
    cache = p
    await db.eventos.add({ ts: agora, tipo, almas: 0, ref, rotulo, nivel: nivelDeAlmas(p.almas) })
  })
}

/* ───────────────────────────── troféus ────────────────────────────────── */

async function contextoTrofeu(): Promise<ContextoTrofeu> {
  const p = (await db.perfil.get(1))!
  const [anime, livro, jogo, total] = await Promise.all([
    db.obras.where({ tipo: 'anime', estado: 'concluido' }).count(),
    db.obras.where({ tipo: 'livro', estado: 'concluido' }).count(),
    db.obras.where({ tipo: 'jogo', estado: 'concluido' }).count(),
    db.obras.count(),
  ])
  return {
    contadores: p.contadores,
    nivel: nivelDeAlmas(p.almas),
    momentum: decairMomentum(p.momentum, p.momentumEm, Date.now()),
    atributos: p.atributos,
    obrasPorTipo: { anime, livro, jogo },
    obrasNoGrimorio: total,
  }
}

export async function conferirTrofeus(): Promise<string[]> {
  const novos: string[] = []
  // Um troféu paga Almas, que podem destravar outro. Duas passadas bastam.
  for (let volta = 0; volta < 2; volta++) {
    const ctx = await contextoTrofeu()
    const ganhos = new Set((await db.trofeus.toArray()).map((t) => t.id))
    const pendentes = conquistados(ctx).filter((t) => !ganhos.has(t))
    if (!pendentes.length) break
    for (const idTrofeu of pendentes) {
      await db.trofeus.put({ id: idTrofeu, ganhoEm: Date.now() })
      novos.push(idTrofeu)
      canalTrofeu.emitir({ id: idTrofeu })
      const nivel = nivelAgora()
      const almas = comMultiplicador(GANHO.trofeu, nivel)
      const agora = Date.now()
      await db.transaction('rw', db.perfil, db.eventos, async () => {
        const p = (await db.perfil.get(1))!
        p.almas += almas
        p.atributos.persistencia += almas
        await db.perfil.put(p)
        cache = p
        await db.eventos.add({
          ts: agora,
          tipo: 'trofeu',
          almas,
          atributo: 'persistencia',
          ref: idTrofeu,
          rotulo: 'troféu',
          nivel: nivelDeAlmas(p.almas),
        })
      })
      canalGanho.emitir({ almas, rotulo: 'troféu', atributo: 'persistencia' })
    }
  }
  return novos
}

/* ───────────────────────────── missões ────────────────────────────────── */

export async function criarMissao(
  c: Capturado,
  padrao: { energia: Energia },
): Promise<Missao | null> {
  if (!c.titulo.trim()) return null
  const agora = Date.now()
  const ultima = await db.missoes.orderBy('ordem').last()
  const missao: Missao = {
    id: id(),
    titulo: c.titulo.trim(),
    primeiroPasso: c.primeiroPasso,
    atributo: c.atributo ?? palpiteDeAtributo(c.titulo),
    energia: c.energia ?? padrao.energia,
    prazo: c.prazo,
    criadaEm: agora,
    tocadaEm: agora,
    adiamentos: 0,
    ordem: (ultima?.ordem ?? 0) + 1,
  }
  await db.missoes.add(missao)
  return missao
}

export async function tocar(missaoId: string) {
  await db.missoes.update(missaoId, { tocadaEm: Date.now() })
}

export async function editarMissao(missaoId: string, mudanca: Partial<Missao>) {
  await db.missoes.update(missaoId, { ...mudanca, tocadaEm: Date.now() })
}

export async function apagarMissao(missaoId: string) {
  await db.transaction('rw', db.missoes, db.passos, db.perfil, async () => {
    await db.passos.where('missaoId').equals(missaoId).delete()
    await db.missoes.delete(missaoId)
    const p = (await db.perfil.get(1))!
    if (p.focoId === missaoId) {
      p.focoId = undefined
      await db.perfil.put(p)
      cache = p
    }
  })
}

export async function concluirMissao(missao: Missao, origem?: { x: number; y: number }) {
  if (missao.concluidaEm) return
  const agora = Date.now()
  const passos = await db.passos.where('missaoId').equals(missao.id).toArray()
  const abandonadaHa = agora - missao.tocadaEm
  const momentumAtual = decairMomentum(cache?.momentum ?? 0, cache?.momentumEm ?? agora, agora)

  let base = GANHO.missao
  if (missao.primeiroPasso) base += GANHO.bonusPrimeiroPasso
  if (missao.energia === 'baixa') base += GANHO.bonusBaixaEnergia
  // Passos que sobraram fecham junto, sem cobrar nem pagar de novo.
  base += Math.min(3, passos.filter((s) => !s.feitoEm).length) * 2

  await db.transaction('rw', db.missoes, db.passos, db.perfil, async () => {
    await db.missoes.update(missao.id, { concluidaEm: agora, tocadaEm: agora })
    await Promise.all(
      passos.filter((s) => !s.feitoEm).map((s) => db.passos.update(s.id, { feitoEm: agora })),
    )
    const p = (await db.perfil.get(1))!
    if (p.focoId === missao.id) {
      p.focoId = undefined
      p.focoEm = undefined
      await db.perfil.put(p)
      cache = p
    }
  })

  await premiar({
    base,
    atributo: missao.atributo,
    tipo: 'missao',
    rotulo: missao.titulo,
    ref: missao.id,
    momentum: MOMENTUM_GANHO.missao,
    origem,
    contar: (p) => {
      p.contadores.missoes++
      if (missao.primeiroPasso) p.contadores.primeirosPassos++
      if (missao.energia === 'baixa') p.contadores.baixaEnergia++
      if (missao.sorteada) p.contadores.sorteiosConcluidos++
      if (abandonadaHa > 14 * DIA) p.contadores.retomadas++
      if (momentumAtual < 10) p.contadores.reacendimentos++
    },
  })
}

/**
 * Desmarcar é correção de erro, não punição: a missão volta pra lista e
 * **as Almas ficam**. Não existe caminho no código que tire pontos.
 */
export async function desmarcarMissao(missaoId: string) {
  await db.missoes.update(missaoId, { concluidaEm: undefined, tocadaEm: Date.now() })
}

export async function empurrarParaHoje(missao: Missao) {
  await db.missoes.update(missao.id, {
    prazo: hoje(),
    tocadaEm: Date.now(),
    adiamentos: missao.adiamentos + 1,
  })
  await anotar('adiar', missao.titulo, missao.id, (p) => p.contadores.adiamentos++)
  await conferirTrofeus()
}

export async function definirFoco(missaoId: string | undefined, sorteada = false) {
  const agora = Date.now()
  await db.transaction('rw', db.perfil, db.missoes, async () => {
    const p = (await db.perfil.get(1))!
    p.focoId = missaoId
    p.focoEm = missaoId ? agora : undefined
    if (sorteada) p.contadores.sorteios++
    p.momentum = somarMomentum(
      decairMomentum(p.momentum, p.momentumEm, agora),
      MOMENTUM_GANHO.focoDefinido,
    )
    p.momentumEm = agora
    await db.perfil.put(p)
    cache = p
    if (missaoId) {
      await db.missoes.update(missaoId, { tocadaEm: agora, ...(sorteada ? { sorteada: true } : {}) })
    }
  })
}

/**
 * "Me dá uma missão." Decidir é caro; o app decide.
 * Sorteio ponderado: favorece o que tem primeiro passo declarado (mais fácil de
 * começar) e o que está esquecido há mais tempo. Nunca pune o atrasado.
 */
export async function sortearMissao(energia: Energia): Promise<Missao | null> {
  const teto = ORDEM_ENERGIA.indexOf(energia)
  const abertas = await db.missoes.filter((m) => !m.concluidaEm).toArray()
  const perfilAtual = await db.perfil.get(1)
  const candidatas = abertas.filter(
    (m) => ORDEM_ENERGIA.indexOf(m.energia) <= teto && m.id !== perfilAtual?.focoId,
  )
  if (!candidatas.length) return null

  const agora = Date.now()
  const pesos = candidatas.map((m) => {
    let peso = 1
    if (m.primeiroPasso) peso += 1.4
    const paradaDias = (agora - m.tocadaEm) / DIA
    peso += Math.min(2, paradaDias / 7)
    if (m.energia === 'baixa') peso += 0.3
    return peso
  })
  const total = pesos.reduce((a, b) => a + b, 0)
  let sorte = Math.random() * total
  let escolhida = candidatas[candidatas.length - 1]
  for (let i = 0; i < candidatas.length; i++) {
    sorte -= pesos[i]
    if (sorte <= 0) {
      escolhida = candidatas[i]
      break
    }
  }
  await definirFoco(escolhida.id, true)
  return escolhida
}

/* ────────────────────────────── passos ────────────────────────────────── */

export async function adicionarPassos(missao: Missao, textos: string[]) {
  const limpos = textos.map((t) => t.trim()).filter(Boolean)
  if (!limpos.length) return
  const agora = Date.now()
  const existentes = await db.passos.where('missaoId').equals(missao.id).count()
  const novos: Passo[] = limpos.map((texto, i) => ({
    id: id(),
    missaoId: missao.id,
    texto,
    ordem: existentes + i,
    criadoEm: agora,
  }))
  const primeiraQuebra = !missao.quebradaEm
  const totalPassos = existentes + novos.length

  await db.transaction('rw', db.passos, db.missoes, async () => {
    await db.passos.bulkAdd(novos)
    await db.missoes.update(missao.id, {
      tocadaEm: agora,
      ...(primeiraQuebra ? { quebradaEm: agora } : {}),
    })
  })

  await premiar({
    base: primeiraQuebra ? GANHO.quebrar : 0,
    atributo: missao.atributo,
    tipo: 'quebrar',
    rotulo: `quebrou "${missao.titulo}"`,
    ref: missao.id,
    contar: (p) => {
      if (primeiraQuebra) p.contadores.quebras++
      p.contadores.quebraMaxima = Math.max(p.contadores.quebraMaxima, totalPassos)
    },
  })
}

export async function concluirPasso(passo: Passo, missao: Missao, origem?: { x: number; y: number }) {
  if (passo.feitoEm) {
    await db.passos.update(passo.id, { feitoEm: undefined })
    return
  }
  await db.transaction('rw', db.passos, db.missoes, async () => {
    await db.passos.update(passo.id, { feitoEm: Date.now() })
    await db.missoes.update(missao.id, { tocadaEm: Date.now() })
  })
  await premiar({
    base: GANHO.passo,
    atributo: missao.atributo,
    tipo: 'passo',
    rotulo: passo.texto,
    ref: missao.id,
    momentum: MOMENTUM_GANHO.passo,
    origem,
    contar: (p) => p.contadores.passos++,
  })
}

export async function apagarPasso(passoId: string) {
  await db.passos.delete(passoId)
}

/* ────────────────────────────── grimório ──────────────────────────────── */

export async function salvarObra(parcial: Omit<Obra, 'id' | 'criadaEm' | 'atualizadaEm' | 'atual'> & { atual?: number }) {
  const agora = Date.now()
  const obra: Obra = {
    ...parcial,
    id: id(),
    atual: parcial.atual ?? 0,
    criadaEm: agora,
    atualizadaEm: agora,
  }
  await db.obras.add(obra)
  if (obra.estado === 'concluido') await recompensarObra(obra)
  await conferirTrofeus()
  return obra
}

export async function atualizarObra(obraId: string, mudanca: Partial<Obra>) {
  await db.obras.update(obraId, { ...mudanca, atualizadaEm: Date.now() })
}

export async function apagarObra(obraId: string) {
  await db.obras.delete(obraId)
}

async function recompensarObra(obra: Obra, origem?: { x: number; y: number }) {
  await premiar({
    base: GANHO.obra[obra.tipo],
    atributo: TIPO_OBRA[obra.tipo].atributo,
    tipo: 'obra',
    rotulo: obra.titulo,
    ref: obra.id,
    momentum: MOMENTUM_GANHO.obra,
    origem,
    contar: (p) => p.contadores.obras++,
  })
}

export async function mudarEstadoObra(obra: Obra, estado: EstadoObra, origem?: { x: number; y: number }) {
  if (obra.estado === estado) return
  const agora = Date.now()
  await db.obras.update(obra.id, {
    estado,
    atualizadaEm: agora,
    concluidaEm: estado === 'concluido' ? agora : obra.concluidaEm,
    ...(estado === 'concluido' && obra.total ? { atual: obra.total } : {}),
  })

  if (estado === 'concluido' && !obra.concluidaEm) {
    await recompensarObra({ ...obra, estado }, origem)
  } else if (estado === 'abandonado') {
    // Largar fecha um ciclo aberto na cabeça. Isso vale Almas, não vergonha.
    await premiar({
      base: GANHO.largar,
      atributo: TIPO_OBRA[obra.tipo].atributo,
      tipo: 'obra-largada',
      rotulo: `larguei "${obra.titulo}"`,
      ref: obra.id,
      origem,
      contar: (p) => p.contadores.largadas++,
    })
  }
  await conferirTrofeus()
}

export async function marcarPlatina(obra: Obra, origem?: { x: number; y: number }) {
  if (obra.platina) return
  await db.obras.update(obra.id, { platina: true, percentualTrofeus: 100, atualizadaEm: Date.now() })
  await premiar({
    base: GANHO.platina,
    atributo: 'persistencia',
    tipo: 'obra',
    rotulo: `platina — ${obra.titulo}`,
    ref: obra.id,
    momentum: MOMENTUM_GANHO.obra,
    origem,
    contar: (p) => p.contadores.platinas++,
  })
}

export async function alternarDesafio(obra: Obra, desafioId: string, origem?: { x: number; y: number }) {
  const desafios = (obra.desafios ?? []).map((d) =>
    d.id === desafioId ? { ...d, feito: !d.feito } : d,
  )
  const alvo = desafios.find((d) => d.id === desafioId)
  await db.obras.update(obra.id, { desafios, atualizadaEm: Date.now() })
  if (alvo?.feito) {
    await premiar({
      base: GANHO.desafioJogo,
      atributo: 'persistencia',
      tipo: 'obra',
      rotulo: alvo.texto,
      ref: obra.id,
      origem,
      contar: (p) => p.contadores.desafios++,
    })
  }
}

export async function adicionarDesafio(obra: Obra, texto: string) {
  const desafios = [...(obra.desafios ?? []), { id: id(), texto: texto.trim(), feito: false }]
  await db.obras.update(obra.id, { desafios, atualizadaEm: Date.now() })
}

export async function removerDesafio(obra: Obra, desafioId: string) {
  await db.obras.update(obra.id, {
    desafios: (obra.desafios ?? []).filter((d) => d.id !== desafioId),
    atualizadaEm: Date.now(),
  })
}

export async function registrarProgresso(obra: Obra, atual: number) {
  const limite = obra.total ?? (obra.tipo === 'jogo' ? 100 : undefined)
  const valor = Math.max(0, limite ? Math.min(limite, atual) : atual)
  await db.obras.update(obra.id, {
    atual: valor,
    atualizadaEm: Date.now(),
    estado: obra.estado === 'planejado' ? 'andamento' : obra.estado,
  })
  if (limite && valor >= limite && obra.estado !== 'concluido') {
    await mudarEstadoObra({ ...obra, atual: valor }, 'concluido')
  }
}

/* ─────────────────────────── perfil / config ──────────────────────────── */

export async function marcarNivelVisto(nivel: number) {
  await db.perfil.update(1, { nivelVisto: nivel })
}

export async function definirEnergiaAtual(energia: Energia) {
  await db.config.update(1, { energiaAtual: energia })
}

export function obrasDoTipo(tipo: TipoObra) {
  return db.obras.where('tipo').equals(tipo)
}
