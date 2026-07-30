import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Missao, type Passo } from '../dados/db'
import { definirFoco, sortearMissao } from '../dados/acoes'
import { useConfig, usePerfil } from '../estado/hooks'
import { CartaoFoco, DetalheMissao, LinhaMissao, useMissoesAbertas, textoDeAtaque } from '../ui/missao'
import { Bandeja, Botao, Vazio } from '../ui/pecas'
import { IconeDado, IconeRetomar } from '../ui/icones'
import { ENERGIA, ORDEM_ENERGIA } from '../dominio/tipos'
import { definirEnergiaAtual } from '../dados/acoes'
import { TracosEnergia } from '../ui/pecas'

/**
 * O Núcleo.
 *
 * Três coisas acionáveis, nesta ordem, e nada mais:
 *   1. onde eu estava            (recuperação de contexto)
 *   2. o foco de hoje            (uma coisa por vez, grande)
 *   3. os próximos dois          (menores, secundários)
 *
 * Sem widget, sem resumo, sem gráfico. Se não coube aqui, mora atrás de um
 * toque explícito — nunca atrás de um menu.
 */

export function Nucleo({ irPara }: { irPara: (aba: string) => void }) {
  const perfil = usePerfil()
  const config = useConfig()
  const abertas = useMissoesAbertas()
  const [aberta, setAberta] = useState<string | null>(null)
  const [escolhendo, setEscolhendo] = useState(false)

  const passosDoFoco = useLiveQuery<Passo[]>(
    () =>
      perfil.focoId
        ? db.passos.where('missaoId').equals(perfil.focoId).sortBy('ordem')
        : Promise.resolve([] as Passo[]),
    [perfil.focoId],
  )

  const foco = useMemo(
    () => abertas.find((m) => m.id === perfil.focoId),
    [abertas, perfil.focoId],
  )

  // "Onde eu estava": a última missão tocada que não seja o próprio foco.
  const retomar = useMemo(() => {
    const candidatas = abertas
      .filter((m) => m.id !== perfil.focoId && m.tocadaEm > m.criadaEm + 1500)
      .sort((a, b) => b.tocadaEm - a.tocadaEm)
    return candidatas[0]
  }, [abertas, perfil.focoId])

  const proximos = useMemo(
    () => abertas.filter((m) => m.id !== perfil.focoId && m.id !== retomar?.id).slice(0, 2),
    [abertas, perfil.focoId, retomar?.id],
  )

  async function sortear() {
    const m = await sortearMissao(config.energiaAtual)
    if (!m) setEscolhendo(true)
  }

  return (
    <div className="space-y-4">
      {retomar && <Retomar missao={retomar} aoRetomar={() => void definirFoco(retomar.id)} />}

      {foco ? (
        <CartaoFoco
          missao={foco}
          passos={passosDoFoco ?? []}
          aoAbrir={() => setAberta(foco.id)}
          aoTrocar={() => setEscolhendo(true)}
        />
      ) : abertas.length > 0 ? (
        <SemFoco aoSortear={() => void sortear()} aoEscolher={() => setEscolhendo(true)} />
      ) : (
        <Vazio
          titulo="Nada aqui dentro ainda."
          dica="Jogue a primeira coisa que estiver ocupando espaço na sua cabeça. Não precisa organizar."
          acao={
            <Botao peso="brasa" onClick={() => window.dispatchEvent(new CustomEvent('almas:capturar'))}>
              + despejar a primeira
            </Botao>
          }
        />
      )}

      {proximos.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-[0.66rem] uppercase tracking-[0.28em] text-tenue">
            depois disso
          </h2>
          <div className="space-y-2">
            {proximos.map((m) => (
              <LinhaMissao key={m.id} missao={m} aoAbrir={() => setAberta(m.id)} />
            ))}
          </div>
          {abertas.length > 3 && (
            <button
              onClick={() => irPara('missoes')}
              className="toque area-toque mt-2 w-full rounded-lg px-2 text-[0.78rem] text-tenue hover:text-texto"
            >
              e mais {abertas.length - (foco ? 1 : 0) - proximos.length - (retomar ? 1 : 0)} guardadas
              — abrir tudo
            </button>
          )}
        </section>
      )}

      <DetalheMissao missaoId={aberta} aoFechar={() => setAberta(null)} />

      <EscolherFoco
        aberto={escolhendo}
        aoFechar={() => setEscolhendo(false)}
        missoes={abertas}
        aoSortear={() => void sortear()}
      />
    </div>
  )
}

/* ───────────────────────────── retomar ───────────────────────────────── */

function Retomar({ missao, aoRetomar }: { missao: Missao; aoRetomar: () => void }) {
  const { alvo } = textoDeAtaque(missao)
  const quando = quandoFoi(missao.tocadaEm)
  return (
    <section className="anima-entrar flex items-center gap-3 rounded-xl bg-pedra-alta/60 px-3 py-2.5 ring-1 ring-limite">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-pedra text-brasa">
        <IconeRetomar tamanho={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.62rem] uppercase tracking-[0.24em] text-tenue">
          você estava {quando} em
        </p>
        <p className="truncate text-[0.95rem] text-texto">{alvo}</p>
      </div>
      <Botao peso="pedra" onClick={aoRetomar} className="h-10 shrink-0 text-[0.85rem]">
        retomar
      </Botao>
    </section>
  )
}

function quandoFoi(ts: number): string {
  const min = (Date.now() - ts) / 60_000
  if (min < 90) return 'agora há pouco'
  const dias = Math.floor(min / 1440)
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias < 7) return `há ${dias} dias`
  if (dias < 30) return `há ${Math.floor(dias / 7)} semanas`
  return 'faz um tempo'
}

/* ─────────────────────────── sem foco ainda ──────────────────────────── */

function SemFoco({ aoSortear, aoEscolher }: { aoSortear: () => void; aoEscolher: () => void }) {
  const config = useConfig()
  return (
    <section className="superficie anima-entrar relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute inset-x-0 -top-16 h-32"
        style={{ background: 'radial-gradient(50% 100% at 50% 100%, rgba(232,163,61,0.12), transparent)' }}
      />
      <p className="relative text-[0.66rem] uppercase tracking-[0.28em] text-brasa">foco de hoje</p>
      <p className="relative mt-2 text-[1.3rem] font-semibold leading-snug text-texto">
        Nenhum escolhido ainda.
      </p>
      <p className="relative mt-1 text-sm text-fraco">
        Escolher também cansa. Deixa o app decidir por você.
      </p>

      <div className="relative mt-4">
        <p className="mb-1.5 text-[0.66rem] uppercase tracking-[0.18em] text-tenue">
          como você está agora
        </p>
        <div className="flex gap-2">
          {ORDEM_ENERGIA.map((e) => (
            <button
              key={e}
              onClick={() => void definirEnergiaAtual(e)}
              className={`toque flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[0.72rem] ${
                config.energiaAtual === e
                  ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40'
                  : 'bg-pedra-alta text-fraco'
              }`}
            >
              <TracosEnergia energia={e} />
              {ENERGIA[e].frase}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2">
        <Botao peso="brasa" onClick={aoSortear} className="h-12 flex-1">
          <IconeDado tamanho={18} /> me dá uma missão
        </Botao>
        <Botao peso="pedra" onClick={aoEscolher} className="h-12">
          escolher
        </Botao>
      </div>
    </section>
  )
}

/* ───────────────────────── escolher / trocar foco ────────────────────── */

function EscolherFoco({
  aberto,
  aoFechar,
  missoes,
  aoSortear,
}: {
  aberto: boolean
  aoFechar: () => void
  missoes: Missao[]
  aoSortear: () => void
}) {
  const [busca, setBusca] = useState('')
  const filtradas = missoes.filter((m) =>
    `${m.titulo} ${m.primeiroPasso ?? ''}`.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <Bandeja
      aberta={aberto}
      aoFechar={aoFechar}
      titulo="Qual é o foco"
      rodape={
        <Botao
          peso="brasa"
          className="h-12 w-full"
          onClick={() => {
            aoSortear()
            aoFechar()
          }}
        >
          <IconeDado tamanho={18} /> escolhe por mim
        </Botao>
      }
    >
      <input
        autoFocus
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="procurar…"
        className="mb-3 w-full rounded-lg bg-pedra-alta px-3 py-2.5 outline-none ring-1 ring-transparent focus:ring-brasa/50"
      />
      <div className="space-y-1">
        {filtradas.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              void definirFoco(m.id)
              aoFechar()
            }}
            className="toque flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-pedra-alta"
          >
            <TracosEnergia energia={m.energia} />
            <span className="min-w-0 flex-1 truncate text-[0.95rem]">{textoDeAtaque(m).alvo}</span>
          </button>
        ))}
        {filtradas.length === 0 && (
          <p className="py-6 text-center text-sm text-tenue">Nada com esse nome.</p>
        )}
      </div>
    </Bandeja>
  )
}
