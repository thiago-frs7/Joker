import type { AtributoId } from '../dominio/tipos'

/**
 * Canal de recompensa. Existe para que o feedback visual saia em menos de 100ms,
 * *antes* de qualquer ida ao IndexedDB: quem conclui algo emite o pulso na hora
 * e a escrita acontece atrás. A tela nunca espera o banco.
 */

export interface Ganho {
  almas: number
  atributo?: AtributoId
  rotulo: string
  /** De onde o número sai voando na tela. Sem isso, sai da própria barra. */
  origem?: { x: number; y: number }
}

export interface SubidaDeCamada {
  nivel: number
}

type Ouvinte<T> = (e: T) => void

function canal<T>() {
  const ouvintes = new Set<Ouvinte<T>>()
  return {
    ouvir(fn: Ouvinte<T>) {
      ouvintes.add(fn)
      return () => {
        ouvintes.delete(fn)
      }
    },
    emitir(e: T) {
      ouvintes.forEach((fn) => fn(e))
    },
  }
}

export const canalGanho = canal<Ganho>()
export const canalCamada = canal<SubidaDeCamada>()
export const canalTrofeu = canal<{ id: string }>()

/** Vibração curta em quem tem motor. Recompensa física, literalmente. */
export function tremer(padrao: number | number[] = 12) {
  try {
    navigator.vibrate?.(padrao)
  } catch {
    /* ignora — nem todo aparelho tem, e não é essencial */
  }
}

export function coordenadasDe(el: Element | null | undefined): { x: number; y: number } | undefined {
  if (!el) return undefined
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}
