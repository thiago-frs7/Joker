/**
 * Ícones desenhados à mão em SVG.
 *
 * Glifo de fonte não serve: cada sistema desenha um, alguns nem existem, e o
 * peso nunca bate com o resto. Traço de 1.5 em currentColor combina com a
 * tipografia e some sem gritar quando a aba não está ativa.
 */

type Props = { tamanho?: number; className?: string }

function Base({ tamanho = 20, className = '', children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  )
}

/** Núcleo — o losango com a brasa dentro. Mesma marca do ícone do app. */
export const IconeNucleo = (p: Props) => (
  <Base {...p}>
    <path d="M12 2.8 21.2 12 12 21.2 2.8 12Z" />
    <circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none" />
  </Base>
)

/** Missões — lista com um item quebrado em passos. */
export const IconeMissoes = (p: Props) => (
  <Base {...p}>
    <path d="M4 6.5h16M4 12h9M4 17.5h9" />
    <path d="M16 12v5.5h4" />
    <circle cx="20.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </Base>
)

/** Grimório — três lombadas na prateleira. */
export const IconeGrimorio = (p: Props) => (
  <Base {...p}>
    <path d="M4 4.5h4v15H4zM10.5 4.5h4v15h-4z" />
    <path d="M17.2 5.6l3.3.9-3.6 13.4-3.3-.9" />
  </Base>
)

/** Ascensão — a constelação de atributos. */
export const IconeAscensao = (p: Props) => (
  <Base {...p}>
    <path d="M12 3.2l7.6 4.4v8.8L12 20.8 4.4 16.4V7.6Z" />
    <path d="M12 8.4l4 2.3v4.6l-4 2.3-4-2.3v-4.6Z" opacity="0.55" />
  </Base>
)

/** Troféus — a impressão permanente. */
export const IconeTrofeus = (p: Props) => (
  <Base {...p}>
    <path d="M7.5 3.5h9l-1 6.2a3.6 3.6 0 0 1-7 0Z" />
    <path d="M7.6 5.2H4.8a3.2 3.2 0 0 0 3.2 4.4M16.4 5.2h2.8a3.2 3.2 0 0 1-3.2 4.4" />
    <path d="M12 13.4v4M8.8 20.5h6.4" />
  </Base>
)

/** Ajustes — controles deslizantes, não engrenagem. Aqui se regula, não se configura. */
export const IconeAjustes = (p: Props) => (
  <Base {...p}>
    <path d="M4 8h9M17 8h3M4 16h4M12 16h8" />
    <circle cx="15" cy="8" r="2.1" />
    <circle cx="10" cy="16" r="2.1" />
  </Base>
)

/** Quebrar — um caminho que se divide em pedaços menores. */
export const IconeQuebrar = (p: Props) => (
  <Base {...p}>
    <path d="M12 3.5v5M12 8.5c0 3-6 2.2-6 5.4v1.6M12 8.5c0 3 6 2.2 6 5.4v1.6" />
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="18" r="2.2" />
  </Base>
)

/** Sorte — o dado de quem não quer decidir. */
export const IconeDado = (p: Props) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <circle cx="8.6" cy="8.6" r="1.35" fill="currentColor" stroke="none" />
    <circle cx="15.4" cy="15.4" r="1.35" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
  </Base>
)

/** Retomar — a volta ao que ficou pela metade. */
export const IconeRetomar = (p: Props) => (
  <Base {...p}>
    <path d="M4.2 10.4a8 8 0 1 1 .6 5.2" />
    <path d="M3.4 4.6v5.8h5.8" />
  </Base>
)

/** Empurrar pra hoje. Neutro: só desloca, não cobra. */
export const IconeEmpurrar = (p: Props) => (
  <Base {...p}>
    <path d="M5 12h11M11.5 7.5 16 12l-4.5 4.5M19.5 5.5v13" />
  </Base>
)

export const ICONE_ABA: Record<string, (p: Props) => React.ReactElement> = {
  nucleo: IconeNucleo,
  missoes: IconeMissoes,
  grimorio: IconeGrimorio,
  ascensao: IconeAscensao,
  trofeus: IconeTrofeus,
  ajustes: IconeAjustes,
}
