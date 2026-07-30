import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Obra } from '../dados/db'
import {
  adicionarDesafio,
  alternarDesafio,
  apagarObra,
  atualizarObra,
  marcarPlatina,
  mudarEstadoObra,
  registrarProgresso,
  removerDesafio,
} from '../dados/acoes'
import { coordenadasDe } from '../dados/pulso'
import { ESTADO_OBRA, TIPO_OBRA, type EstadoObra } from '../dominio/tipos'
import { Aro, Bandeja, Botao, Etiqueta } from './pecas'

const ORDEM_ESTADO: EstadoObra[] = ['planejado', 'andamento', 'concluido', 'abandonado']

/* ──────────────────────────── capa e cartão ───────────────────────────── */

export function Capa({ obra, className = '' }: { obra: Obra; className?: string }) {
  const [quebrou, setQuebrou] = useState(false)
  // Sem capa (ou com capa que não carregou) a lombada é desenhada: o título em
  // serifa sobre a pedra, com o glifo do tipo apagado atrás. Estante nenhuma
  // fica com buraco.
  if (!obra.capa || quebrou) {
    return (
      <div className={`relative overflow-hidden bg-pedra-alta ${className}`} aria-hidden>
        <span className="absolute -bottom-3 -right-2 text-[3.4rem] leading-none text-pedra-viva">
          {TIPO_OBRA[obra.tipo].glifo}
        </span>
        {/* começa abaixo da faixa de estado, que mora no topo à esquerda */}
        <span className="absolute inset-x-2 top-9 line-clamp-4 text-left font-[family-name:var(--font-display)] text-[0.72rem] font-semibold leading-tight text-fraco">
          {obra.titulo}
        </span>
      </div>
    )
  }
  return (
    <img
      src={obra.capa}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setQuebrou(true)}
      className={`object-cover ${className}`}
    />
  )
}

export function CartaoObra({ obra, aoAbrir }: { obra: Obra; aoAbrir: () => void }) {
  const fracao = obra.total ? Math.min(1, obra.atual / obra.total) : 0
  return (
    <button onClick={aoAbrir} className="group flex h-full w-full flex-col text-left">
      <div className="relative w-full flex-1 overflow-hidden rounded-lg bg-pedra">
        <Capa obra={obra} className="h-full w-full" />
        {/* Estado como marca discreta no canto — nunca cor de alerta. */}
        {obra.estado !== 'planejado' && (
          <span className="absolute left-1 top-1 rounded bg-cripta/85 px-1.5 py-0.5 text-[0.58rem] uppercase tracking-[0.1em] text-fraco">
            {ESTADO_OBRA[obra.estado].nome}
          </span>
        )}
        {obra.platina && (
          <span
            className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-cripta/85 text-[0.6rem] text-brasa"
            title="Platina"
          >
            ◆
          </span>
        )}
        {obra.estado === 'andamento' && obra.total ? (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-cripta/70">
            <span
              className="block h-full bg-brasa transition-[width] duration-500"
              style={{ width: `${fracao * 100}%` }}
            />
          </span>
        ) : null}
      </div>
      <span className="mt-1.5 line-clamp-2 text-[0.74rem] leading-tight text-fraco group-hover:text-texto">
        {obra.titulo}
      </span>
    </button>
  )
}

/* ─────────────────────────────── detalhe ──────────────────────────────── */

export function DetalheObra({ obraId, aoFechar }: { obraId: string | null; aoFechar: () => void }) {
  const obra = useLiveQuery(() => (obraId ? db.obras.get(obraId) : undefined), [obraId])
  const [novoDesafio, setNovoDesafio] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  if (!obraId || !obra) return null
  const meta = TIPO_OBRA[obra.tipo]
  const total = obra.total ?? (obra.tipo === 'jogo' ? 100 : undefined)
  const fracao = total ? Math.min(1, obra.atual / total) : 0

  return (
    <Bandeja
      aberta
      aoFechar={aoFechar}
      titulo={meta.nome}
      rodape={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (confirmando) {
                void apagarObra(obra.id)
                aoFechar()
              } else setConfirmando(true)
            }}
            className="toque area-toque px-1 text-[0.78rem] text-tenue hover:text-texto"
          >
            {confirmando ? 'tirar da estante?' : 'tirar da estante'}
          </button>
          <Botao peso="fantasma" onClick={aoFechar}>
            fechar
          </Botao>
        </div>
      }
    >
      <div className="flex gap-3.5">
        <Capa obra={obra} className="h-36 w-24 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.05rem] font-semibold leading-tight">{obra.titulo}</h3>
          {obra.autoria && <p className="mt-1 text-[0.8rem] text-tenue">{obra.autoria}</p>}
          {obra.ano && <p className="text-[0.8rem] text-tenue">{obra.ano}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Etiqueta ativa={obra.estado === 'concluido'}>{ESTADO_OBRA[obra.estado].nome}</Etiqueta>
            {obra.nota !== undefined && <Etiqueta>nota {obra.nota}</Etiqueta>}
          </div>
        </div>
      </div>

      {/* estado */}
      <div className="mt-5">
        <p className="mb-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">Onde isso está</p>
        <div className="grid grid-cols-2 gap-2">
          {ORDEM_ESTADO.map((e) => (
            <button
              key={e}
              onClick={(ev) => void mudarEstadoObra(obra, e, coordenadasDe(ev.currentTarget))}
              className={`toque rounded-lg px-3 text-[0.85rem] ${
                obra.estado === e
                  ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40'
                  : 'bg-pedra-alta text-fraco hover:text-texto'
              }`}
            >
              {ESTADO_OBRA[e].nome}
            </button>
          ))}
        </div>
        {obra.estado === 'abandonado' && (
          <p className="mt-2 rounded-lg bg-pedra-alta px-3 py-2 text-[0.78rem] leading-relaxed text-fraco">
            Largar fecha um ciclo aberto na sua cabeça. Isso é decisão, não fracasso — e por isso
            também paga Almas.
          </p>
        )}
      </div>

      {/* progresso */}
      {total ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-tenue">Progresso</p>
            <span className="text-[0.78rem] text-fraco">
              {obra.atual} / {total} {meta.unidade}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Aro fracao={fracao} tamanho={52} grossura={5}>
              <span className="numeral text-[0.8rem] text-brasa">{Math.round(fracao * 100)}</span>
            </Aro>
            <div className="flex flex-1 flex-wrap gap-2">
              {(obra.tipo === 'jogo' ? [5, 10, 25] : [1, 5, 10]).map((n) => (
                <Botao
                  key={n}
                  peso="pedra"
                  className="h-11 flex-1 text-[0.85rem]"
                  onClick={() => void registrarProgresso(obra, obra.atual + n)}
                >
                  +{n}
                </Botao>
              ))}
              <Botao
                peso="pedra"
                className="h-11 text-[0.85rem]"
                onClick={() => void registrarProgresso(obra, total)}
              >
                fim
              </Botao>
            </div>
          </div>
        </div>
      ) : null}

      {/* nota */}
      <div className="mt-5">
        <p className="mb-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">
          Nota <span className="normal-case tracking-normal">(opcional, sempre)</span>
        </p>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() =>
                void atualizarObra(obra.id, { nota: obra.nota === n ? undefined : n })
              }
              className={`toque min-h-0 w-9 rounded-lg text-[0.82rem] ${
                obra.nota === n
                  ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40'
                  : 'bg-pedra-alta text-fraco hover:text-texto'
              }`}
              style={{ minWidth: 36, minHeight: 40 }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* jogos */}
      {obra.tipo === 'jogo' && (
        <div className="mt-6 border-t border-limite pt-4">
          <p className="mb-2.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">Troféus do jogo</p>

          <div className="flex items-center gap-3">
            <button
              onClick={(ev) => void marcarPlatina(obra, coordenadasDe(ev.currentTarget))}
              disabled={obra.platina}
              className={`toque flex flex-1 items-center justify-center gap-2 rounded-lg text-[0.9rem] ${
                obra.platina
                  ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40'
                  : 'bg-pedra-alta text-fraco hover:text-texto'
              }`}
            >
              ◆ {obra.platina ? 'platinado' : 'marcar platina'}
            </button>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[0.78rem] text-fraco">percentual de troféus</span>
              <span className="numeral text-[0.95rem] text-brasa">
                {obra.percentualTrofeus ?? 0}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={obra.percentualTrofeus ?? 0}
              onChange={(e) =>
                void atualizarObra(obra.id, { percentualTrofeus: Number(e.target.value) })
              }
              className="w-full accent-[var(--color-brasa)]"
              aria-label="Percentual de troféus"
            />
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[0.78rem] text-fraco">desafios que você mesmo inventou</p>
            <ul className="space-y-1">
              {(obra.desafios ?? []).map((d) => (
                <li key={d.id} className="flex items-center gap-1">
                  <button
                    onClick={(ev) => void alternarDesafio(obra, d.id, coordenadasDe(ev.currentTarget))}
                    className="toque flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 text-left hover:bg-pedra-alta"
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem] ring-1 ${
                        d.feito ? 'bg-brasa/20 text-brasa ring-brasa/40' : 'text-transparent ring-limite'
                      }`}
                    >
                      ✦
                    </span>
                    <span className={`text-[0.88rem] ${d.feito ? 'text-tenue line-through' : 'text-fraco'}`}>
                      {d.texto}
                    </span>
                  </button>
                  <button
                    onClick={() => void removerDesafio(obra, d.id)}
                    aria-label="Remover desafio"
                    className="toque shrink-0 px-2 text-tenue hover:text-texto"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <input
              value={novoDesafio}
              onChange={(e) => setNovoDesafio(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && novoDesafio.trim()) {
                  e.preventDefault()
                  void adicionarDesafio(obra, novoDesafio)
                  setNovoDesafio('')
                }
              }}
              placeholder="ex.: zerar sem morrer no chefe final"
              className="mt-2 w-full rounded-lg bg-pedra-alta px-3 py-2.5 text-[0.9rem] outline-none ring-1 ring-transparent focus:ring-brasa/50"
            />
          </div>
        </div>
      )}

      {/* Sinopse à vista e cortada, nunca dentro de um acordeão fechado. */}
      {obra.sinopse && (
        <div className="mt-6 border-t border-limite pt-4">
          <p className="mb-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">Sinopse</p>
          <p className="line-clamp-5 text-[0.85rem] leading-relaxed text-fraco">{obra.sinopse}</p>
        </div>
      )}
    </Bandeja>
  )
}
