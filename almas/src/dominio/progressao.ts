/**
 * Toda a matemática de progressão. Funções puras, sem estado.
 *
 * Regra estrutural: **nada aqui subtrai**. Não existe função que remova Almas,
 * rebaixe nível ou zere momentum. A ausência de punição não é uma configuração
 * que se pode desligar — é o fato de o código não ter o caminho.
 */

/** Almas acumuladas necessárias para *chegar* na camada n. */
export function almasParaNivel(nivel: number): number {
  if (nivel <= 1) return 0
  return Math.round(50 * Math.pow(nivel - 1, 1.7))
}

/** Camada atual a partir do total de Almas. Derivada, nunca armazenada. */
export function nivelDeAlmas(almas: number): number {
  if (almas <= 0) return 1
  return Math.floor(Math.pow(almas / 50, 1 / 1.7)) + 1
}

/** Ganho aumenta com a camada — a curva sobe, o rendimento também. */
export function multiplicador(nivel: number): number {
  return 1 + (nivel - 1) * 0.12
}

export interface Progresso {
  nivel: number
  almas: number
  /** Almas já conquistadas dentro da camada atual. */
  noNivel: number
  /** Almas que a camada atual pede, do início ao fim. */
  faltaNivel: number
  /** 0..1 — o preenchimento da barra. */
  fracao: number
  restante: number
}

export function progresso(almas: number): Progresso {
  const nivel = nivelDeAlmas(almas)
  const piso = almasParaNivel(nivel)
  const teto = almasParaNivel(nivel + 1)
  const noNivel = almas - piso
  const faltaNivel = teto - piso
  return {
    nivel,
    almas,
    noNivel,
    faltaNivel,
    fracao: faltaNivel > 0 ? Math.min(1, noNivel / faltaNivel) : 0,
    restante: Math.max(0, teto - almas),
  }
}

/* ─────────────────────────── valores de ganho ─────────────────────────── */

export const GANHO = {
  /** Um passo já paga. A recompensa não espera a missão inteira acabar. */
  passo: 5,
  missao: 16,
  /** Missão que tinha primeiro passo de 2 minutos declarado: começar é o mérito. */
  bonusPrimeiroPasso: 4,
  /** Fazer algo com pouca energia custa mais caro por dentro. */
  bonusBaixaEnergia: 5,
  /** Fatiar o grande demais é trabalho de verdade — paga na hora de planejar. */
  quebrar: 6,
  /** Fechar um ciclo aberto libera memória. Largar também é decisão. */
  largar: 8,
  obra: { anime: 26, livro: 34, jogo: 30 } as const,
  platina: 90,
  desafioJogo: 12,
  trofeu: 40,
} as const

/** Aplica o multiplicador de camada e arredonda. */
export function comMultiplicador(base: number, nivel: number): number {
  return Math.max(1, Math.round(base * multiplicador(nivel)))
}

/* ─────────────────────────────── momentum ─────────────────────────────── */

/**
 * Momentum substitui streak. Sobe rápido, desce devagar, **nunca zera**:
 * é decaimento exponencial, então tende a zero sem nunca chegar — e qualquer
 * ação recoloca você na curva. Não existe "você perdeu seus 43 dias".
 */
export const MOMENTUM_MAX = 100
const MEIA_VIDA_DIAS = 9

export function decairMomentum(valor: number, desdeMs: number, agora: number): number {
  const dias = Math.max(0, (agora - desdeMs) / 86_400_000)
  if (dias === 0) return valor
  return valor * Math.pow(0.5, dias / MEIA_VIDA_DIAS)
}

export function somarMomentum(valor: number, ganho: number): number {
  // Curva com teto suave: quanto mais perto de 100, menos cada ação empurra.
  const espaco = (MOMENTUM_MAX - valor) / MOMENTUM_MAX
  return Math.min(MOMENTUM_MAX, valor + ganho * (0.35 + 0.65 * espaco))
}

export const MOMENTUM_GANHO = { passo: 3, missao: 9, obra: 7, focoDefinido: 1 } as const

export interface FaseMomentum {
  id: 'brasa' | 'chama' | 'fogueira' | 'incendio'
  nome: string
  /** O que essa fase significa, sem cobrança. */
  legenda: string
}

export function faseMomentum(v: number): FaseMomentum {
  if (v >= 70) return { id: 'incendio', nome: 'Incêndio', legenda: 'você está em chamas' }
  if (v >= 40) return { id: 'fogueira', nome: 'Fogueira', legenda: 'aceso e firme' }
  if (v >= 15) return { id: 'chama', nome: 'Chama', legenda: 'queimando baixo' }
  return { id: 'brasa', nome: 'Brasa', legenda: 'a brasa continua acesa' }
}

/* ───────────────────────────── atributos ──────────────────────────────── */

/** Atributos sobem numa curva mais curta — evoluir um Ramo tem que ser visível. */
export function nivelAtributo(almas: number): number {
  if (almas <= 0) return 0
  return Math.floor(Math.pow(almas / 26, 1 / 1.55))
}

export function almasParaNivelAtributo(nivel: number): number {
  if (nivel <= 0) return 0
  return Math.round(26 * Math.pow(nivel, 1.55))
}

export function progressoAtributo(almas: number) {
  const nivel = nivelAtributo(almas)
  const piso = almasParaNivelAtributo(nivel)
  const teto = almasParaNivelAtributo(nivel + 1)
  return {
    nivel,
    almas,
    fracao: teto > piso ? Math.min(1, (almas - piso) / (teto - piso)) : 0,
    restante: Math.max(0, teto - almas),
  }
}
