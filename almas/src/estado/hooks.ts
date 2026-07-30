import { useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, configPadrao, perfilPadrao, type Config, type Perfil } from '../dados/db'
import { guardarPerfilEmCache } from '../dados/acoes'
import { decairMomentum, progresso } from '../dominio/progressao'

export function usePerfil(): Perfil {
  const perfil = useLiveQuery(() => db.perfil.get(1), [])
  useEffect(() => {
    guardarPerfilEmCache(perfil)
  }, [perfil])
  return perfil ?? perfilPadrao()
}

export function useConfig(): Config {
  const config = useLiveQuery(() => db.config.get(1), [])
  return config ?? configPadrao()
}

export function useProgresso(perfil: Perfil) {
  return useMemo(() => progresso(perfil.almas), [perfil.almas])
}

/** Momentum decai em tempo real — o valor na tela é sempre o de agora. */
export function useMomentum(perfil: Perfil): number {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])
  return useMemo(
    () => decairMomentum(perfil.momentum, perfil.momentumEm, agora),
    [perfil.momentum, perfil.momentumEm, agora],
  )
}

/**
 * Número que sobe. Almas nunca aparecem trocando de valor num corte seco —
 * subir é metade da recompensa.
 */
export function useContagem(alvo: number, duracao = 620): number {
  const [valor, setValor] = useState(alvo)
  const deRef = useRef(alvo)
  const quadroRef = useRef(0)

  useEffect(() => {
    const de = deRef.current
    if (de === alvo) return
    const reduzido =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduzido || Math.abs(alvo - de) > 5000) {
      deRef.current = alvo
      setValor(alvo)
      return
    }
    const inicio = performance.now()
    const passo = (t: number) => {
      const k = Math.min(1, (t - inicio) / duracao)
      const suave = 1 - Math.pow(1 - k, 3)
      const atual = Math.round(de + (alvo - de) * suave)
      setValor(atual)
      deRef.current = atual
      if (k < 1) quadroRef.current = requestAnimationFrame(passo)
      else deRef.current = alvo
    }
    quadroRef.current = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadroRef.current)
  }, [alvo, duracao])

  return valor
}

/** Atalhos de teclado globais. Velocidade de entrada importa mais que menu. */
export function useAtalho(tecla: string, acao: () => void, ativo = true) {
  useEffect(() => {
    if (!ativo) return
    const alvo = tecla.toLowerCase()
    const ouvir = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const digitando =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (alvo === 'escape') {
        if (e.key === 'Escape') {
          e.preventDefault()
          acao()
        }
        return
      }
      if (digitando) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.toLowerCase() === alvo) {
        e.preventDefault()
        acao()
      }
    }
    window.addEventListener('keydown', ouvir)
    return () => window.removeEventListener('keydown', ouvir)
  }, [tecla, acao, ativo])
}

export function useAgora(intervalo = 60_000): number {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), intervalo)
    return () => clearInterval(t)
  }, [intervalo])
  return agora
}
