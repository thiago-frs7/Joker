import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Virtualização de lista sobre a rolagem da própria página.
 *
 * O Grimório precisa aguentar centenas de registros sem engasgar, mas container
 * com rolagem interna dentro de página que também rola é uma armadilha no
 * celular. Então a janela é a própria página: medimos onde a lista começa e só
 * montamos as linhas que cabem na tela, com espaçadores em cima e embaixo.
 */

export function ListaVirtual<T>({
  itens,
  alturaLinha,
  colunas = 1,
  espaco = 0,
  folga = 4,
  render,
  className = '',
}: {
  itens: T[]
  /** Altura de uma linha, incluindo o espaço até a próxima. */
  alturaLinha: number
  colunas?: number
  espaco?: number
  /** Linhas extras renderizadas fora da tela, de cada lado. */
  folga?: number
  render: (item: T, indice: number) => ReactNode
  className?: string
}) {
  const caixaRef = useRef<HTMLDivElement>(null)
  const [janela, setJanela] = useState({ de: 0, ate: 24 })

  const passo = alturaLinha + espaco
  const linhas = Math.ceil(itens.length / colunas)

  useEffect(() => {
    const recalcular = () => {
      const caixa = caixaRef.current
      if (!caixa) return
      const topo = caixa.getBoundingClientRect().top + window.scrollY
      const inicio = Math.max(0, Math.floor((window.scrollY - topo) / passo) - folga)
      const cabem = Math.ceil(window.innerHeight / passo) + folga * 2
      setJanela({ de: inicio, ate: Math.min(linhas, inicio + cabem) })
    }
    recalcular()
    window.addEventListener('scroll', recalcular, { passive: true })
    window.addEventListener('resize', recalcular)
    return () => {
      window.removeEventListener('scroll', recalcular)
      window.removeEventListener('resize', recalcular)
    }
  }, [passo, linhas, folga])

  const de = Math.min(janela.de, Math.max(0, linhas - 1))
  const ate = Math.min(janela.ate, linhas)
  const visiveis: ReactNode[] = []

  for (let linha = de; linha < ate; linha++) {
    const inicio = linha * colunas
    const fatia = itens.slice(inicio, inicio + colunas)
    visiveis.push(
      <div
        key={linha}
        className={colunas > 1 ? 'grid' : ''}
        style={{
          height: alturaLinha,
          marginBottom: espaco,
          ...(colunas > 1
            ? { gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`, gap: espaco }
            : {}),
        }}
      >
        {fatia.map((item, i) => render(item, inicio + i))}
      </div>,
    )
  }

  return (
    <div ref={caixaRef} className={className}>
      <div style={{ height: de * passo }} />
      {visiveis}
      <div style={{ height: Math.max(0, (linhas - ate) * passo) }} />
    </div>
  )
}
