import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../dados/db'
import { useMomentum, usePerfil, useProgresso } from '../estado/hooks'
import { ATRIBUTO, ATRIBUTOS, type AtributoId } from '../dominio/tipos'
import {
  MOMENTUM_MAX,
  faseMomentum,
  nivelAtributo,
  progressoAtributo,
} from '../dominio/progressao'
import { TituloDeTela } from '../ui/pecas'

/**
 * Ascensão.
 *
 * A recompensa de longo prazo — e por isso a tela mais trabalhada do app.
 * A constelação não é gráfico de dashboard: é a sua forma. Cada estrela é um
 * atributo, a distância do centro é o nível, e o polígono que elas desenham é
 * a silhueta do que você tem feito. Cresce devagar, nunca encolhe.
 */

const RAIO = 116
const CENTRO = 160
// A viewBox é mais larga que o desenho de propósito: os nomes dos atributos
// moram fora do círculo e não podem ser cortados pela borda do SVG.
const CAIXA = '-72 6 464 308'

function ponto(indice: number, fracao: number) {
  const angulo = (-Math.PI / 2) + (indice * 2 * Math.PI) / ATRIBUTOS.length
  return {
    x: CENTRO + Math.cos(angulo) * RAIO * fracao,
    y: CENTRO + Math.sin(angulo) * RAIO * fracao,
  }
}

export function Ascensao() {
  const perfil = usePerfil()
  const p = useProgresso(perfil)
  const momentum = useMomentum(perfil)
  const [selecionado, setSelecionado] = useState<AtributoId | null>(null)

  const niveis = useMemo(
    () =>
      Object.fromEntries(
        ATRIBUTOS.map((a) => [a, nivelAtributo(perfil.atributos[a] ?? 0)]),
      ) as Record<AtributoId, number>,
    [perfil.atributos],
  )

  // A escala respira: o desenho sempre ocupa a tela, mesmo no começo.
  const teto = Math.max(4, ...ATRIBUTOS.map((a) => niveis[a] + 1))

  const historico = useLiveQuery(async () => {
    const eventos = await db.eventos.orderBy('ts').toArray()
    const primeiraVez = new Map<number, number>()
    for (const e of eventos) if (!primeiraVez.has(e.nivel)) primeiraVez.set(e.nivel, e.ts)
    return [...primeiraVez.entries()]
      .filter(([nivel]) => nivel > 1)
      .sort((a, b) => a[0] - b[0])
  }, [])

  const alvo = selecionado ?? maiorAtributo(niveis)
  const detalhe = progressoAtributo(perfil.atributos[alvo] ?? 0)
  const fase = faseMomentum(momentum)

  return (
    <div className="space-y-6">
      <TituloDeTela>Ascensão</TituloDeTela>

      {/* camada, em tamanho de monumento */}
      <section className="superficie relative overflow-hidden px-5 pb-5 pt-6 text-center">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(232,163,61,0.16), transparent)' }}
        />
        <p className="relative text-[0.62rem] uppercase tracking-[0.4em] text-brasa">camada</p>
        <p className="numeral relative mt-1 text-[4.6rem] leading-none text-brasa-clara drop-shadow-[0_0_28px_rgba(232,163,61,0.28)]">
          {p.nivel}
        </p>
        <p className="relative mt-2 text-[0.82rem] text-fraco">
          {p.noNivel.toLocaleString('pt-BR')} de {p.faltaNivel.toLocaleString('pt-BR')} almas nesta
          camada
        </p>
      </section>

      {/* constelação */}
      <section className="superficie p-3 pb-5">
        <svg viewBox={CAIXA} className="w-full" role="img" aria-label="Constelação de atributos">
          <defs>
            <radialGradient id="brilho" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e8a33d" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#e8a33d" stopOpacity="0.03" />
            </radialGradient>
            <filter id="fulgor" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.2" result="borrado" />
              <feMerge>
                <feMergeNode in="borrado" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* anéis: cada um é um nível inteiro */}
          {Array.from({ length: teto }, (_, i) => (i + 1) / teto).map((f, i) => (
            <circle
              key={i}
              cx={CENTRO}
              cy={CENTRO}
              r={RAIO * f}
              fill="none"
              stroke="var(--color-limite)"
              strokeWidth={0.7}
              opacity={0.7}
            />
          ))}

          {/* eixos */}
          {ATRIBUTOS.map((a, i) => {
            const fim = ponto(i, 1)
            return (
              <line
                key={a}
                x1={CENTRO}
                y1={CENTRO}
                x2={fim.x}
                y2={fim.y}
                stroke="var(--color-limite)"
                strokeWidth={0.7}
                opacity={0.6}
              />
            )
          })}

          {/* a silhueta */}
          <polygon
            points={ATRIBUTOS.map((a, i) => {
              const f = Math.max(0.06, niveis[a] / teto)
              const q = ponto(i, f)
              return `${q.x},${q.y}`
            }).join(' ')}
            fill="url(#brilho)"
            stroke="var(--color-brasa)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            opacity={0.9}
            style={{ transition: 'all 700ms cubic-bezier(0.16,0.9,0.3,1)' }}
          />

          {/* estrelas */}
          {ATRIBUTOS.map((a, i) => {
            const f = Math.max(0.06, niveis[a] / teto)
            const q = ponto(i, f)
            const ativa = a === alvo
            return (
              <g key={a} onClick={() => setSelecionado(a)} style={{ cursor: 'pointer' }}>
                <circle cx={q.x} cy={q.y} r={14} fill="transparent" />
                <circle
                  cx={q.x}
                  cy={q.y}
                  r={ativa ? 5.5 : 3.6 + Math.min(2.4, niveis[a] * 0.22)}
                  fill={ativa ? 'var(--color-brasa-clara)' : 'var(--color-brasa)'}
                  filter="url(#fulgor)"
                  style={{ transition: 'all 500ms cubic-bezier(0.16,0.9,0.3,1)' }}
                />
              </g>
            )
          })}

          {/* nomes na borda */}
          {ATRIBUTOS.map((a, i) => {
            const q = ponto(i, 1.15)
            const ativa = a === alvo
            return (
              <text
                key={a}
                x={q.x}
                y={q.y}
                textAnchor={q.x > CENTRO + 6 ? 'start' : q.x < CENTRO - 6 ? 'end' : 'middle'}
                dominantBaseline="middle"
                fontSize={9.5}
                letterSpacing={0.6}
                fill={ativa ? 'var(--color-brasa)' : 'var(--color-tenue)'}
                onClick={() => setSelecionado(a)}
                style={{ cursor: 'pointer', textTransform: 'uppercase' }}
              >
                {ATRIBUTO[a].nome}
                <tspan fill={ativa ? 'var(--color-brasa-clara)' : 'var(--color-fraco)'} dx={4}>
                  {niveis[a]}
                </tspan>
              </text>
            )
          })}
        </svg>

        {/* o atributo em foco, escrito por extenso */}
        <div className="mt-1 rounded-xl bg-pedra-alta p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[1.05rem] text-texto">
              <span className="mr-1.5 text-brasa">{ATRIBUTO[alvo].glifo}</span>
              {ATRIBUTO[alvo].nome}
            </h3>
            <span className="numeral text-[1.3rem] text-brasa">{detalhe.nivel}</span>
          </div>
          <p className="mt-1 text-[0.8rem] text-tenue">{ATRIBUTO[alvo].sussurro}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-pedra">
            <div
              className="h-full rounded-full bg-brasa transition-[width] duration-700"
              style={{ width: `${detalhe.fracao * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-[0.72rem] text-tenue">
            {detalhe.almas.toLocaleString('pt-BR')} almas neste ramo · faltam {detalhe.restante} pro
            nível {detalhe.nivel + 1}
          </p>
        </div>
      </section>

      {/* momentum */}
      <section className="superficie p-4">
        <div className="mb-2 flex items-baseline gap-2.5">
          <h2 className="text-[0.66rem] uppercase tracking-[0.28em] text-fraco">momentum</h2>
          <span className="text-[0.8rem] text-brasa">{fase.nome}</span>
        </div>
        <Fogueira valor={momentum} />
        <p className="mt-2.5 text-[0.78rem] leading-relaxed text-tenue">
          {fase.legenda}. Sobe rápido quando você faz algo e desce devagar quando não faz —{' '}
          <b className="text-fraco">nunca zera</b>. Não é contagem de dias, não tem o que perder.
        </p>
      </section>

      {/* histórico */}
      <section>
        <h2 className="mb-2 px-1 text-[0.66rem] uppercase tracking-[0.28em] text-fraco">
          camadas atravessadas
        </h2>
        {historico && historico.length > 0 ? (
          <ol className="superficie divide-y divide-limite">
            {historico
              .slice()
              .reverse()
              .map(([nivel, ts]) => (
                <li key={nivel} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="numeral w-8 shrink-0 text-[1.05rem] text-brasa">{nivel}</span>
                  <span className="flex-1 text-[0.85rem] text-fraco">
                    camada {nivel} alcançada
                  </span>
                  <span className="text-[0.75rem] text-tenue">
                    {new Date(ts).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </span>
                </li>
              ))}
          </ol>
        ) : (
          <div className="superficie px-4 py-5 text-center">
            <p className="text-[0.85rem] text-tenue">
              A primeira camada nova aparece aqui assim que você virar de nível.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

function maiorAtributo(niveis: Record<AtributoId, number>): AtributoId {
  return ATRIBUTOS.reduce((a, b) => (niveis[b] > niveis[a] ? b : a), ATRIBUTOS[0])
}

/** Momentum como fogo, não como número: 24 línguas de chama que sobem juntas. */
function Fogueira({ valor }: { valor: number }) {
  const k = Math.min(1, valor / MOMENTUM_MAX)
  const chamas = 24
  return (
    <div className="flex h-14 items-end gap-[3px]" aria-label={`Momentum ${Math.round(valor)}`}>
      {Array.from({ length: chamas }, (_, i) => {
        const centro = Math.abs(i - (chamas - 1) / 2) / ((chamas - 1) / 2)
        const altura = Math.max(0.08, k * (1 - centro * 0.55) * (0.75 + 0.25 * Math.sin(i * 1.7)))
        const acesa = k > 0.02
        return (
          <span
            key={i}
            className="flex-1 rounded-t-sm transition-[height] duration-700"
            style={{
              height: `${Math.max(6, altura * 100)}%`,
              background: acesa
                ? 'linear-gradient(180deg, var(--color-brasa-clara), var(--color-brasa) 42%, var(--color-brasa-funda))'
                : 'var(--color-pedra-viva)',
              opacity: acesa ? 0.35 + 0.65 * k : 1,
            }}
          />
        )
      })}
    </div>
  )
}
