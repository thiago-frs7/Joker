import { useEffect, useRef, useState } from 'react'
import { canalCamada, canalGanho, type Ganho } from '../dados/pulso'
import { useContagem, useMomentum, usePerfil, useProgresso } from '../estado/hooks'
import { faseMomentum } from '../dominio/progressao'
import { ATRIBUTO } from '../dominio/tipos'
import { marcarNivelVisto } from '../dados/acoes'

/**
 * A Barra de Almas.
 *
 * É a única coisa presente em todas as telas e o detalhe mais bem executado do
 * app — de propósito. Ela responde a *toda* ação em menos de 100ms: o número
 * sobe, o preenchimento cresce, a brasa pulsa, o ganho voa do lugar exato onde
 * o dedo tocou. É aqui que mora a dopamina.
 */

interface Voando extends Ganho {
  chave: number
}

export function BarraDeAlmas() {
  const perfil = usePerfil()
  const p = useProgresso(perfil)
  const momentum = useMomentum(perfil)
  const almasVisiveis = useContagem(perfil.almas)

  const [voando, setVoando] = useState<Voando[]>([])
  const [batendo, setBatendo] = useState(false)
  const [camada, setCamada] = useState<number | null>(null)
  const trilhaRef = useRef<HTMLDivElement>(null)
  const seq = useRef(0)

  useEffect(() => {
    return canalGanho.ouvir((g) => {
      const chave = ++seq.current
      setVoando((v) => [...v, { ...g, chave }])
      setBatendo(true)
      setTimeout(() => setVoando((v) => v.filter((x) => x.chave !== chave)), 1050)
      setTimeout(() => setBatendo(false), 440)
    })
  }, [])

  useEffect(() => {
    return canalCamada.ouvir(({ nivel }) => {
      setCamada(nivel)
      setTimeout(() => setCamada(null), 2600)
    })
  }, [])

  useEffect(() => {
    if (perfil.nivelVisto !== p.nivel) void marcarNivelVisto(p.nivel)
  }, [p.nivel, perfil.nivelVisto])

  const fase = faseMomentum(momentum)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="bg-cripta/92 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pb-2.5 pt-[max(0.6rem,env(safe-area-inset-top))]">
            <Selo nivel={p.nivel} batendo={batendo} />

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="flex items-baseline gap-1.5">
                  <span
                    className={`numeral text-[1.35rem] leading-none text-brasa-clara ${
                      batendo ? 'anima-bater' : ''
                    }`}
                    style={{ display: 'inline-block' }}
                  >
                    {almasVisiveis.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-[0.22em] text-fraco">almas</span>
                </span>
                <span className="truncate text-[0.68rem] tracking-[0.06em] text-tenue">
                  faltam {p.restante.toLocaleString('pt-BR')}
                </span>
              </div>
              <Trilha fracao={p.fracao} ref={trilhaRef} />
            </div>

            <Brasa valor={momentum} titulo={`Momentum: ${fase.nome} — ${fase.legenda}`} />
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-limite to-transparent" />
      </header>

      {/* camada de ganhos: fora do fluxo, nunca empurra nada */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {voando.map((g) => (
          <NumeroVoando key={g.chave} ganho={g} />
        ))}
      </div>

      {camada !== null && <SubidaDeCamada nivel={camada} />}
    </>
  )
}

/* ────────────────────────────── peças ────────────────────────────────── */

function Selo({ nivel, batendo }: { nivel: number; batendo: boolean }) {
  return (
    <div className="relative shrink-0" aria-label={`Camada ${nivel}`}>
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl bg-pedra-alta ring-1 ring-limite ${
          batendo ? 'anima-pulso' : ''
        }`}
      >
        <span className="numeral text-[1.4rem] leading-none text-brasa">{nivel}</span>
      </div>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-cripta px-1 text-[0.55rem] uppercase tracking-[0.2em] text-tenue">
        camada
      </span>
    </div>
  )
}

const Trilha = ({ fracao, ref }: { fracao: number; ref?: React.Ref<HTMLDivElement> }) => {
  const pct = Math.max(fracao * 100, fracao > 0 ? 1.5 : 0)
  return (
    <div
      ref={ref}
      className="relative h-2.5 overflow-hidden rounded-full bg-pedra-alta"
      role="progressbar"
      aria-valuenow={Math.round(fracao * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso da camada"
    >
      {/* sulco: a pista vazia tem profundidade, não é só cinza */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" />
      <div
        className="anima-lamber absolute inset-y-0 left-0 overflow-hidden rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.16,0.9,0.3,1)]"
        style={{
          width: `${pct}%`,
          background:
            'linear-gradient(90deg, var(--color-brasa-funda), var(--color-brasa) 78%, var(--color-brasa-clara))',
          boxShadow: 'calc(var(--brilho-brasa) * 0px) 0 12px rgba(232,163,61,0.45)',
          opacity: 'calc(0.55 + 0.45 * var(--brilho-brasa))',
        }}
      />
      {fracao > 0 && (
        <div
          className="absolute top-1/2 h-3.5 w-[3px] -translate-y-1/2 rounded-full bg-brasa-clara transition-[left] duration-700 ease-[cubic-bezier(0.16,0.9,0.3,1)]"
          style={{ left: `calc(${pct}% - 1.5px)`, boxShadow: '0 0 8px 2px rgba(255,217,160,0.7)' }}
        />
      )}
    </div>
  )
}

function Brasa({ valor, titulo }: { valor: number; titulo: string }) {
  const k = Math.min(1, valor / 100)
  return (
    <div className="grid shrink-0 place-items-center" title={titulo} aria-label={titulo}>
      <div
        className="h-3.5 w-3.5 rounded-full"
        style={{
          background: `radial-gradient(circle at 40% 35%, var(--color-brasa-clara), var(--color-brasa-funda))`,
          opacity: 0.35 + 0.65 * k,
          boxShadow: `0 0 ${4 + 12 * k}px ${1 + 3 * k}px rgba(232,163,61,${0.15 + 0.5 * k})`,
        }}
      />
    </div>
  )
}

function NumeroVoando({ ganho }: { ganho: Voando }) {
  const x = ganho.origem?.x ?? window.innerWidth / 2
  const y = ganho.origem?.y ?? 90
  const faiscas = Array.from({ length: 5 }, (_, i) => i)
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="anima-alma absolute left-0 top-0 whitespace-nowrap">
        <span className="numeral rounded-full bg-cripta/85 px-2.5 py-1 text-[1.05rem] text-brasa-clara shadow-[0_0_20px_rgba(232,163,61,0.35)]">
          +{ganho.almas}
        </span>
        {ganho.atributo && (
          <span className="ml-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-brasa">
            {ATRIBUTO[ganho.atributo].nome}
          </span>
        )}
      </div>
      {faiscas.map((i) => (
        <span
          key={i}
          className="anima-faisca absolute h-1 w-1 rounded-full bg-brasa-clara"
          style={
            {
              '--dx': `${(Math.random() - 0.5) * 90}px`,
              '--dy': `${-20 - Math.random() * 60}px`,
              animationDelay: `${i * 24}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

function SubidaDeCamada({ nivel }: { nivel: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center">
      <div
        className="anima-clarao absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 42%, rgba(232,163,61,0.32), transparent 70%)',
        }}
      />
      <div className="anima-entrar relative -mt-10 text-center">
        <p className="text-[0.7rem] uppercase tracking-[0.42em] text-brasa">nova camada</p>
        <p className="numeral mt-1 text-[5rem] leading-none text-brasa-clara drop-shadow-[0_0_24px_rgba(232,163,61,0.5)]">
          {nivel}
        </p>
      </div>
    </div>
  )
}
