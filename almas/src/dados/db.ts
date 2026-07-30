import Dexie, { type EntityTable } from 'dexie'
import type { AtributoId, Energia, EstadoObra, TipoObra } from '../dominio/tipos'
import { ATRIBUTOS } from '../dominio/tipos'

/* ───────────────────────────── entidades ──────────────────────────────── */

export interface Missao {
  id: string
  titulo: string
  /** A menor ação física possível. Quando existe, é ELE que aparece grande, não o título. */
  primeiroPasso?: string
  atributo: AtributoId
  energia: Energia
  /** Meia-noite do dia alvo, em ms. Ausente = sem prazo, e isso é normal. */
  prazo?: number
  criadaEm: number
  /** Qualquer toque atualiza — é o que alimenta o "Retomar". */
  tocadaEm: number
  concluidaEm?: number
  /** Marcada quando a missão ganha sub-passos pela primeira vez. */
  quebradaEm?: number
  adiamentos: number
  /** Veio do "me dá uma missão". */
  sorteada?: boolean
  ordem: number
  nota?: string
}

export interface Passo {
  id: string
  missaoId: string
  texto: string
  ordem: number
  feitoEm?: number
  criadoEm: number
}

export interface Obra {
  id: string
  tipo: TipoObra
  titulo: string
  capa?: string
  estado: EstadoObra
  fonte: 'jikan' | 'google-books' | 'rawg' | 'manual'
  fonteId?: string
  autoria?: string
  ano?: number
  total?: number
  atual: number
  nota?: number
  sinopse?: string
  criadaEm: number
  atualizadaEm: number
  concluidaEm?: number
  /** Só jogos. */
  platina?: boolean
  percentualTrofeus?: number
  desafios?: DesafioJogo[]
}

export interface DesafioJogo {
  id: string
  texto: string
  feito: boolean
}

export type TipoEvento =
  | 'missao'
  | 'passo'
  | 'obra'
  | 'obra-largada'
  | 'trofeu'
  | 'adiar'
  | 'quebrar'
  | 'sorteio'
  | 'retomada'
  | 'foco'

export interface Evento {
  id?: number
  ts: number
  tipo: TipoEvento
  almas: number
  atributo?: AtributoId
  ref?: string
  rotulo: string
  /** Camada no momento do evento — é daqui que sai o histórico da Ascensão. */
  nivel: number
}

export interface TrofeuGanho {
  id: string
  ganhoEm: number
}

export interface Perfil {
  id: number
  almas: number
  atributos: Record<AtributoId, number>
  momentum: number
  momentumEm: number
  focoId?: string
  focoEm?: number
  criadoEm: number
  ultimoBackup: number
  /** Última camada que o usuário *viu*. Diferença dispara a celebração. */
  nivelVisto: number
  contadores: Contadores
}

/**
 * Contadores acumulados. Existem porque troféus precisam saber de *situações*
 * ("concluiu algo que estava parado há semanas") que não dá pra reconstruir
 * olhando só o estado final. Todos sobem, nenhum desce.
 */
export interface Contadores {
  missoes: number
  passos: number
  sorteios: number
  sorteiosConcluidos: number
  adiamentos: number
  quebras: number
  quebraMaxima: number
  primeirosPassos: number
  /** Missões concluídas depois de 14+ dias sem toque. */
  retomadas: number
  obras: number
  largadas: number
  baixaEnergia: number
  /** Concluiu algo estando com o momentum quase apagado. */
  reacendimentos: number
  platinas: number
  desafios: number
}

export interface Aba {
  id: string
  nome: string
  oculta: boolean
}

export interface Config {
  id: number
  modoCalmo: boolean
  abas: Aba[]
  chaveRawg?: string
  /** "Como estou agora" — alimenta o filtro e o sorteio. */
  energiaAtual: Energia
  lembreteBackupDias: number
  /** Confirmação de que o usuário leu o aviso de "os dados vivem no navegador". */
  avisoLido: boolean
}

/* ─────────────────────────────── banco ────────────────────────────────── */

const db = new Dexie('almas') as Dexie & {
  missoes: EntityTable<Missao, 'id'>
  passos: EntityTable<Passo, 'id'>
  obras: EntityTable<Obra, 'id'>
  eventos: EntityTable<Evento, 'id'>
  trofeus: EntityTable<TrofeuGanho, 'id'>
  perfil: EntityTable<Perfil, 'id'>
  config: EntityTable<Config, 'id'>
}

db.version(1).stores({
  missoes: 'id, concluidaEm, tocadaEm, criadaEm, prazo, energia, atributo, ordem',
  passos: 'id, missaoId, feitoEm, ordem',
  obras: 'id, tipo, estado, titulo, atualizadaEm, concluidaEm, [tipo+estado]',
  eventos: '++id, ts, tipo, atributo',
  trofeus: 'id, ganhoEm',
  perfil: 'id',
  config: 'id',
})

export { db }

/* ────────────────────────────── padrões ───────────────────────────────── */

export function atributosZerados(): Record<AtributoId, number> {
  return Object.fromEntries(ATRIBUTOS.map((a) => [a, 0])) as Record<AtributoId, number>
}

export function contadoresZerados(): Contadores {
  return {
    missoes: 0,
    passos: 0,
    sorteios: 0,
    sorteiosConcluidos: 0,
    adiamentos: 0,
    quebras: 0,
    quebraMaxima: 0,
    primeirosPassos: 0,
    retomadas: 0,
    obras: 0,
    largadas: 0,
    baixaEnergia: 0,
    reacendimentos: 0,
    platinas: 0,
    desafios: 0,
  }
}

export const ABAS_PADRAO: Aba[] = [
  { id: 'nucleo', nome: 'Núcleo', oculta: false },
  { id: 'missoes', nome: 'Missões', oculta: false },
  { id: 'grimorio', nome: 'Grimório', oculta: false },
  { id: 'ascensao', nome: 'Ascensão', oculta: false },
  { id: 'trofeus', nome: 'Troféus', oculta: false },
  { id: 'ajustes', nome: 'Ajustes', oculta: false },
]

export function perfilPadrao(): Perfil {
  const agora = Date.now()
  return {
    id: 1,
    almas: 0,
    atributos: atributosZerados(),
    momentum: 0,
    momentumEm: agora,
    criadoEm: agora,
    ultimoBackup: agora,
    nivelVisto: 1,
    contadores: contadoresZerados(),
  }
}

export function configPadrao(): Config {
  return {
    id: 1,
    modoCalmo: false,
    abas: ABAS_PADRAO.map((a) => ({ ...a })),
    energiaAtual: 'media',
    lembreteBackupDias: 30,
    avisoLido: false,
  }
}

/**
 * Garante que perfil e config existam. Sem onboarding, sem tela de boas-vindas:
 * o app abre pronto para usar.
 */
export async function garantirBase(): Promise<void> {
  await db.transaction('rw', db.perfil, db.config, async () => {
    if (!(await db.perfil.get(1))) await db.perfil.add(perfilPadrao())
    const cfg = await db.config.get(1)
    if (!cfg) {
      await db.config.add(configPadrao())
    } else {
      // Abas novas de versões futuras entram sem apagar a ordem que o usuário escolheu.
      const faltando = ABAS_PADRAO.filter((p) => !cfg.abas.some((a) => a.id === p.id))
      if (faltando.length) {
        await db.config.update(1, { abas: [...cfg.abas, ...faltando.map((a) => ({ ...a }))] })
      }
    }
  })
}

export function id(): string {
  return crypto.randomUUID()
}
