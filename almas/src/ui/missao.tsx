import { useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Missao, type Passo } from '../dados/db'
import {
  adicionarPassos,
  apagarMissao,
  apagarPasso,
  concluirMissao,
  concluirPasso,
  definirFoco,
  desmarcarMissao,
  editarMissao,
  empurrarParaHoje,
} from '../dados/acoes'
import { coordenadasDe } from '../dados/pulso'
import { ATRIBUTO, ATRIBUTOS, ENERGIA, ORDEM_ENERGIA, type Energia } from '../dominio/tipos'
import { hoje } from '../dominio/captura'
import { Bandeja, Botao, Etiqueta, TracosEnergia, TrilhoDePrazo } from './pecas'
import { IconeEmpurrar, IconeQuebrar } from './icones'

const DIA = 86_400_000

/** O texto que importa: se existe um primeiro passo de 2 minutos, é ELE em destaque. */
export function textoDeAtaque(m: Missao): { alvo: string; sombra?: string } {
  return m.primeiroPasso ? { alvo: m.primeiroPasso, sombra: m.titulo } : { alvo: m.titulo }
}

/* ─────────────────────────── botão de concluir ────────────────────────── */

export function Selar({
  missao,
  tamanho = 'g',
  aoConcluir,
}: {
  missao: Missao
  tamanho?: 'g' | 'p'
  aoConcluir?: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [indo, setIndo] = useState(false)
  const feita = !!missao.concluidaEm
  const d = tamanho === 'g' ? 'h-14 w-14' : 'h-11 w-11'

  return (
    <button
      ref={ref}
      aria-label={feita ? 'Desmarcar' : `Concluir: ${textoDeAtaque(missao).alvo}`}
      onClick={(e) => {
        e.stopPropagation()
        if (feita) {
          void desmarcarMissao(missao.id)
          return
        }
        setIndo(true)
        setTimeout(() => setIndo(false), 460)
        void concluirMissao(missao, coordenadasDe(ref.current))
        aoConcluir?.()
      }}
      className={`${d} grid shrink-0 place-items-center rounded-full ring-1 transition-colors duration-100 ${
        feita
          ? 'bg-brasa/20 text-brasa ring-brasa/40'
          : 'bg-pedra-alta text-tenue ring-limite hover:bg-pedra-viva hover:text-brasa hover:ring-brasa/50'
      } ${indo ? 'anima-pulso' : ''}`}
    >
      <span className={`text-xl leading-none ${indo ? 'anima-bater' : ''}`}>
        {feita ? '✦' : '○'}
      </span>
    </button>
  )
}

/* ──────────────────────────── cartão do foco ──────────────────────────── */

export function CartaoFoco({
  missao,
  passos,
  aoAbrir,
  aoTrocar,
}: {
  missao: Missao
  passos: Passo[]
  aoAbrir: () => void
  aoTrocar: () => void
}) {
  const { alvo, sombra } = textoDeAtaque(missao)
  const feitos = passos.filter((p) => p.feitoEm).length
  const atrasada = missao.prazo !== undefined && missao.prazo < hoje()

  return (
    <section
      className="superficie anima-entrar relative overflow-hidden p-5"
      style={{ boxShadow: '0 1px 0 rgba(255,217,160,0.06) inset' }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-16 h-32 opacity-60"
        style={{ background: 'radial-gradient(50% 100% at 50% 100%, rgba(232,163,61,0.13), transparent)' }}
      />

      <div className="relative mb-4 flex items-center justify-between">
        <span className="text-[0.66rem] uppercase tracking-[0.28em] text-brasa">foco de hoje</span>
        <button
          onClick={aoTrocar}
          className="toque area-toque -mr-2 px-2 text-[0.72rem] text-tenue hover:text-texto"
        >
          trocar
        </button>
      </div>

      <div className="relative flex items-start gap-4">
        <Selar missao={missao} />
        <button onClick={aoAbrir} className="min-w-0 flex-1 text-left">
          <p className="text-[1.42rem] font-semibold leading-tight text-texto">{alvo}</p>
          {sombra && <p className="mt-1 truncate text-sm text-tenue">de: {sombra}</p>}
        </button>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.72rem] text-tenue">
        <span className="inline-flex items-center gap-1.5">
          <TracosEnergia energia={missao.energia} />
          {ENERGIA[missao.energia].nome.toLowerCase()}
        </span>
        <span className="text-limite">·</span>
        <span className="inline-flex items-center gap-1">
          <span className="text-brasa/70">{ATRIBUTO[missao.atributo].glifo}</span>
          {ATRIBUTO[missao.atributo].nome}
        </span>
        {missao.prazo !== undefined && (
          <>
            <span className="text-limite">·</span>
            <TrilhoDePrazo prazo={missao.prazo} />
          </>
        )}
      </div>

      {passos.length > 0 && (
        <ul className="relative mt-4 space-y-1.5 border-l border-limite pl-3">
          {passos.slice(0, 4).map((p) => (
            <li key={p.id}>
              <LinhaPasso passo={p} missao={missao} />
            </li>
          ))}
          {passos.length > 4 && (
            <li>
              <button onClick={aoAbrir} className="text-[0.75rem] text-tenue hover:text-texto">
                + {passos.length - 4} passos
              </button>
            </li>
          )}
        </ul>
      )}

      <div className="relative mt-5 flex flex-wrap items-center gap-2">
        {passos.length === 0 ? (
          <Botao peso="pedra" onClick={aoAbrir} className="h-11">
            <IconeQuebrar tamanho={18} /> quebrar isso
          </Botao>
        ) : (
          <span className="text-[0.72rem] text-tenue">
            {feitos} de {passos.length} passos
          </span>
        )}
        {atrasada && (
          <button
            onClick={() => void empurrarParaHoje(missao)}
            className="toque area-toque inline-flex items-center gap-1.5 rounded-lg px-2 text-[0.75rem] text-fraco hover:text-texto"
          >
            <IconeEmpurrar tamanho={16} /> empurrar pra hoje
          </button>
        )}
      </div>
    </section>
  )
}

/* ───────────────────────────── linha de lista ─────────────────────────── */

export function LinhaMissao({ missao, aoAbrir }: { missao: Missao; aoAbrir: () => void }) {
  const { alvo, sombra } = textoDeAtaque(missao)
  const atrasada = missao.prazo !== undefined && missao.prazo < hoje() && !missao.concluidaEm

  return (
    <div className="superficie flex items-center gap-3 px-3 py-2.5">
      <Selar missao={missao} tamanho="p" />
      <button onClick={aoAbrir} className="min-w-0 flex-1 py-1 text-left">
        <p
          className={`truncate text-[0.98rem] leading-snug ${
            missao.concluidaEm ? 'text-tenue line-through' : 'text-texto'
          }`}
        >
          {alvo}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.7rem] text-tenue">
          {sombra && <span className="truncate opacity-80">de: {sombra}</span>}
          <TracosEnergia energia={missao.energia} />
          <span className="text-brasa/60">{ATRIBUTO[missao.atributo].glifo}</span>
          {missao.prazo !== undefined && <TrilhoDePrazo prazo={missao.prazo} />}
        </div>
      </button>
      {atrasada && (
        <button
          onClick={() => void empurrarParaHoje(missao)}
          title="Empurrar pra hoje"
          aria-label="Empurrar pra hoje"
          className="toque grid shrink-0 place-items-center rounded-lg px-2 text-fraco hover:bg-pedra-alta hover:text-texto"
        >
          <IconeEmpurrar tamanho={18} />
        </button>
      )}
    </div>
  )
}

function LinhaPasso({ passo, missao }: { passo: Passo; missao: Missao }) {
  const ref = useRef<HTMLButtonElement>(null)
  const feito = !!passo.feitoEm
  return (
    <button
      ref={ref}
      onClick={() => void concluirPasso(passo, missao, coordenadasDe(ref.current))}
      className="toque group flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left hover:bg-pedra-alta"
      style={{ minHeight: 40 }}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem] ring-1 ${
          feito ? 'bg-brasa/20 text-brasa ring-brasa/40' : 'text-transparent ring-limite group-hover:ring-brasa/50'
        }`}
      >
        ✦
      </span>
      <span className={`text-[0.88rem] ${feito ? 'text-tenue line-through' : 'text-fraco'}`}>
        {passo.texto}
      </span>
    </button>
  )
}

/* ──────────────────────────── detalhe (bandeja) ───────────────────────── */

export function DetalheMissao({
  missaoId,
  aoFechar,
}: {
  missaoId: string | null
  aoFechar: () => void
}) {
  const missao = useLiveQuery(() => (missaoId ? db.missoes.get(missaoId) : undefined), [missaoId])
  const passos = useLiveQuery(
    () =>
      missaoId
        ? db.passos.where('missaoId').equals(missaoId).sortBy('ordem')
        : Promise.resolve([] as Passo[]),
    [missaoId],
  )
  const [novoPasso, setNovoPasso] = useState('')
  const [primeiro, setPrimeiro] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const campoPasso = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPrimeiro(missao?.primeiroPasso ?? '')
    setNovoPasso('')
    setConfirmando(false)
  }, [missao?.id, missao?.primeiroPasso])

  if (!missaoId || !missao) return null
  const lista = passos ?? []

  async function guardarPasso(texto: string) {
    const linhas = texto.split('\n').map((l) => l.replace(/^[-*•\d.)\s]+/, '').trim())
    const validas = linhas.filter(Boolean)
    if (!validas.length || !missao) return
    await adicionarPassos(missao, validas)
    setNovoPasso('')
    campoPasso.current?.focus()
  }

  const paradaHa = Math.floor((Date.now() - missao.tocadaEm) / DIA)

  return (
    <Bandeja
      aberta
      aoFechar={aoFechar}
      titulo="Missão"
      rodape={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (confirmando) {
                void apagarMissao(missao.id)
                aoFechar()
              } else setConfirmando(true)
            }}
            className="toque area-toque px-1 text-[0.78rem] text-tenue hover:text-texto"
          >
            {confirmando ? 'apagar de vez?' : 'apagar'}
          </button>
          <div className="flex gap-2">
            <Botao
              peso="pedra"
              onClick={() => {
                void definirFoco(missao.id)
                aoFechar()
              }}
            >
              virar foco
            </Botao>
            <Botao
              peso="brasa"
              onClick={() => {
                void concluirMissao(missao)
                aoFechar()
              }}
              disabled={!!missao.concluidaEm}
            >
              concluir
            </Botao>
          </div>
        </div>
      }
    >
      <input
        value={missao.titulo}
        onChange={(e) => void editarMissao(missao.id, { titulo: e.target.value })}
        className="w-full rounded-lg bg-transparent px-1 py-1 text-[1.15rem] font-semibold outline-none focus:bg-pedra-alta"
        aria-label="Título"
      />

      {paradaHa >= 14 && !missao.concluidaEm && (
        <p className="mt-2 rounded-lg bg-pedra-alta px-3 py-2 text-[0.78rem] text-fraco">
          Parada há {paradaHa} dias. Voltar aqui já vale — concluir agora rende o troféu{' '}
          <span className="text-brasa">Ressurgência</span>.
        </p>
      )}

      {/* primeiro passo de 2 minutos */}
      <div className="mt-4">
        <label className="mb-1.5 block text-[0.68rem] uppercase tracking-[0.16em] text-tenue">
          Primeiro passo de 2 minutos
        </label>
        <input
          value={primeiro}
          onChange={(e) => setPrimeiro(e.target.value)}
          onBlur={() => void editarMissao(missao.id, { primeiroPasso: primeiro.trim() || undefined })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          placeholder="a menor ação física possível"
          className="w-full rounded-lg bg-pedra-alta px-3 py-2.5 text-[0.95rem] outline-none ring-1 ring-transparent focus:ring-brasa/50"
        />
        <p className="mt-1 text-[0.7rem] text-tenue">
          Quando existe, é isso que aparece grande na tela — não o título.
        </p>
      </div>

      {/* passos */}
      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="inline-flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">
            <IconeQuebrar tamanho={15} /> quebrar isso
          </span>
          {lista.length > 0 && (
            <span className="text-[0.7rem] text-tenue">
              {lista.filter((p) => p.feitoEm).length}/{lista.length}
            </span>
          )}
        </div>

        {lista.length > 0 && (
          <ul className="mb-2 space-y-1">
            {lista.map((p) => (
              <li key={p.id} className="flex items-center gap-1">
                <div className="min-w-0 flex-1">
                  <LinhaPasso passo={p} missao={missao} />
                </div>
                <button
                  onClick={() => void apagarPasso(p.id)}
                  aria-label="Remover passo"
                  className="toque shrink-0 px-2 text-tenue hover:text-texto"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={campoPasso}
          value={novoPasso}
          onChange={(e) => setNovoPasso(e.target.value)}
          onPaste={(e) => {
            const colado = e.clipboardData.getData('text')
            if (colado.includes('\n')) {
              e.preventDefault()
              void guardarPasso(colado)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void guardarPasso(novoPasso)
            }
          }}
          placeholder={lista.length ? 'mais um passo…' : 'primeiro pedaço, bem pequeno…'}
          className="w-full rounded-lg bg-pedra-alta px-3 py-2.5 text-[0.95rem] outline-none ring-1 ring-transparent focus:ring-brasa/50"
        />
        <p className="mt-1 text-[0.7rem] text-tenue">
          Enter adiciona. Cada passo concluído paga Almas na hora — não espera a missão acabar.
        </p>
      </div>

      {/* etiquetas */}
      <div className="mt-5 space-y-3">
        <div>
          <p className="mb-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">Energia</p>
          <div className="flex gap-2">
            {ORDEM_ENERGIA.map((e) => (
              <button
                key={e}
                onClick={() => void editarMissao(missao.id, { energia: e as Energia })}
                className={`toque flex flex-1 items-center justify-center gap-2 rounded-lg text-sm ${
                  missao.energia === e
                    ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40'
                    : 'bg-pedra-alta text-fraco'
                }`}
              >
                <TracosEnergia energia={e} />
                {ENERGIA[e].nome}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">Quando</p>
          <div className="flex flex-wrap gap-2">
            {[
              { rotulo: 'hoje', valor: hoje() },
              { rotulo: 'amanhã', valor: hoje() + DIA },
              { rotulo: 'em 3 dias', valor: hoje() + 3 * DIA },
              { rotulo: 'semana que vem', valor: hoje() + 7 * DIA },
              { rotulo: 'sem prazo', valor: undefined },
            ].map((op) => (
              <button
                key={op.rotulo}
                onClick={() => void editarMissao(missao.id, { prazo: op.valor })}
                className={`toque min-h-0 rounded-lg px-3 py-2 text-[0.8rem] ${
                  missao.prazo === op.valor
                    ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40'
                    : 'bg-pedra-alta text-fraco hover:text-texto'
                }`}
                style={{ minHeight: 40 }}
              >
                {op.rotulo}
              </button>
            ))}
          </div>
          {missao.prazo !== undefined && (
            <div className="mt-2">
              <TrilhoDePrazo prazo={missao.prazo} />
            </div>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">Atributo</p>
          <div className="flex flex-wrap gap-1.5">
            {ATRIBUTOS.map((a) => (
              <button
                key={a}
                onClick={() => void editarMissao(missao.id, { atributo: a })}
                className={`toque min-h-0 rounded-lg px-2.5 py-1.5 text-[0.78rem] ${
                  missao.atributo === a
                    ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40'
                    : 'bg-pedra-alta text-fraco hover:text-texto'
                }`}
                style={{ minHeight: 36 }}
              >
                <span className="mr-1 opacity-70">{ATRIBUTO[a].glifo}</span>
                {ATRIBUTO[a].nome}
              </button>
            ))}
          </div>
        </div>
      </div>

      {missao.concluidaEm && (
        <p className="mt-5 flex items-center gap-2 text-[0.78rem] text-tenue">
          <Etiqueta ativa>concluída</Etiqueta>
          Desmarcar devolve ela pra lista — e as Almas ficam com você.
        </p>
      )}
    </Bandeja>
  )
}

/** Ordem da lista: sem punição. Atrasadas não sobem, não piscam, não cobram. */
export function useMissoesAbertas() {
  const missoes = useLiveQuery(
    () => db.missoes.filter((m) => !m.concluidaEm).toArray(),
    [],
  )
  return useMemo(() => {
    const lista = missoes ?? []
    return [...lista].sort((a, b) => {
      const pa = a.prazo ?? Number.MAX_SAFE_INTEGER
      const pb = b.prazo ?? Number.MAX_SAFE_INTEGER
      if (pa !== pb) return pa - pb
      return b.tocadaEm - a.tocadaEm
    })
  }, [missoes])
}
