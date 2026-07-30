import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ENERGIA, type Energia } from '../dominio/tipos'
import { hoje } from '../dominio/captura'

/* ────────────────────────────── botões ───────────────────────────────── */

type Peso = 'brasa' | 'pedra' | 'fantasma'

export function Botao({
  peso = 'pedra',
  className = '',
  children,
  ...resto
}: { peso?: Peso } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'toque inline-flex items-center justify-center gap-2 rounded-xl px-4 text-[0.92rem] font-medium transition-colors duration-100 disabled:opacity-40'
  const pesos: Record<Peso, string> = {
    // Brasa = ganho. Usada com avareza: só onde a ação principal está.
    brasa: 'bg-brasa text-cripta font-semibold hover:bg-brasa-clara active:bg-brasa-clara',
    pedra: 'bg-pedra-alta text-texto hover:bg-pedra-viva active:bg-pedra-viva',
    fantasma: 'text-fraco hover:text-texto hover:bg-pedra active:bg-pedra-alta',
  }
  return (
    <button className={`${base} ${pesos[peso]} ${className}`} {...resto}>
      {children}
    </button>
  )
}

/* ───────────────────────────── etiquetas ─────────────────────────────── */

export function Etiqueta({
  children,
  className = '',
  ativa = false,
  ...resto
}: { ativa?: boolean } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.68rem] uppercase tracking-[0.1em] ${
        ativa ? 'bg-brasa/15 text-brasa' : 'bg-pedra-alta text-tenue'
      } ${className}`}
      {...resto}
    >
      {children}
    </span>
  )
}

/** Energia como forma, não como cor: um, dois ou três traços acesos. */
export function TracosEnergia({ energia, className = '' }: { energia: Energia; className?: string }) {
  const meta = ENERGIA[energia]
  return (
    <span
      className={`inline-flex items-end gap-[3px] ${className}`}
      title={`Energia ${meta.nome.toLowerCase()}`}
      aria-label={`Energia ${meta.nome.toLowerCase()}`}
    >
      {[1, 2, 3].map((n) => (
        <i
          key={n}
          className={`block w-[3px] rounded-sm ${n <= meta.traços ? 'bg-brasa' : 'bg-pedra-viva'}`}
          style={{ height: `${4 + n * 3}px` }}
        />
      ))}
    </span>
  )
}

/* ─────────────────────────── tempo visível ───────────────────────────── */

const DIA = 86_400_000
const HORIZONTE = 7

/**
 * Prazo em forma, não em número. "3 dias" não diz nada; sete casinhas com três
 * acesas dizem. Atraso não fica vermelho — só apaga o trilho e oferece o empurrão.
 */
export function TrilhoDePrazo({ prazo, className = '' }: { prazo: number; className?: string }) {
  const dias = Math.round((prazo - hoje()) / DIA)
  const atrasada = dias < 0
  const acesas = Math.max(0, Math.min(HORIZONTE, dias + 1))
  const texto = atrasada
    ? dias === -1
      ? 'de ontem'
      : `parada há ${Math.abs(dias)} dias`
    : dias === 0
      ? 'hoje'
      : dias === 1
        ? 'amanhã'
        : dias <= HORIZONTE
          ? `em ${dias} dias`
          : new Date(prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} title={texto}>
      <span className="flex gap-[2px]" aria-hidden>
        {Array.from({ length: HORIZONTE }, (_, i) => (
          <i
            key={i}
            className={`block h-[7px] w-[3px] rounded-[1px] ${
              i < acesas ? (dias <= 1 ? 'bg-brasa' : 'bg-fraco/70') : 'bg-pedra-viva'
            }`}
          />
        ))}
      </span>
      <span className={`text-[0.68rem] ${dias <= 1 && !atrasada ? 'text-brasa' : 'text-tenue'}`}>
        {texto}
      </span>
    </span>
  )
}

/** Anel de progresso. Redondo porque fechar círculo é a recompensa (Apple Fitness). */
export function Aro({
  fracao,
  tamanho = 44,
  grossura = 4,
  children,
  className = '',
}: {
  fracao: number
  tamanho?: number
  grossura?: number
  children?: ReactNode
  className?: string
}) {
  const r = (tamanho - grossura) / 2
  const c = 2 * Math.PI * r
  return (
    <span className={`relative inline-grid place-items-center ${className}`} style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} className="-rotate-90" aria-hidden>
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          stroke="var(--color-pedra-viva)"
          strokeWidth={grossura}
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          stroke="var(--color-brasa)"
          strokeWidth={grossura}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, fracao)))}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.16,0.9,0.3,1)' }}
        />
      </svg>
      <span className="absolute grid place-items-center">{children}</span>
    </span>
  )
}

/* ──────────────────────────── contêineres ────────────────────────────── */

export function Vazio({ titulo, dica, acao }: { titulo: string; dica?: string; acao?: ReactNode }) {
  return (
    <div className="superficie px-5 py-8 text-center">
      <p className="text-fraco">{titulo}</p>
      {dica && <p className="mt-1.5 text-sm text-tenue">{dica}</p>}
      {acao && <div className="mt-4 flex justify-center">{acao}</div>}
    </div>
  )
}

export function TituloDeTela({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h1 className="titulo-tela text-[0.92rem] text-fraco">{children}</h1>
      {acao}
    </div>
  )
}

/**
 * Bandeja: tudo que precisa de foco total aparece aqui, em cima de tudo.
 * Não existe menu aninhado no app — ou está na tela, ou está numa bandeja
 * aberta por um toque explícito.
 */
export function Bandeja({
  aberta,
  aoFechar,
  titulo,
  children,
  rodape,
}: {
  aberta: boolean
  aoFechar: () => void
  titulo?: string
  children: ReactNode
  rodape?: ReactNode
}) {
  useEffect(() => {
    if (!aberta) return
    const ouvir = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        aoFechar()
      }
    }
    window.addEventListener('keydown', ouvir)
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Enquanto uma bandeja está aberta, o botão de captura some: uma coisa por vez.
    document.body.dataset.bandeja = 'sim'
    return () => {
      window.removeEventListener('keydown', ouvir)
      document.body.style.overflow = antes
      delete document.body.dataset.bandeja
    }
  }, [aberta, aoFechar])

  if (!aberta) return null

  // Portal: a bandeja precisa viver fora do contexto de empilhamento do <main>,
  // senão a barra de navegação e o botão de captura passam por cima dela.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-cripta/80 backdrop-blur-sm" onClick={aoFechar} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="anima-entrar relative flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-2xl bg-pedra ring-1 ring-limite sm:rounded-2xl"
      >
        {titulo && (
          <div className="flex items-center justify-between border-b border-limite px-5 py-3.5">
            <h2 className="titulo-tela text-[0.8rem] text-fraco">{titulo}</h2>
            <button
              onClick={aoFechar}
              className="toque -mr-3 px-3 text-tenue hover:text-texto"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {rodape && (
          <div className="border-t border-limite px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {rodape}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
