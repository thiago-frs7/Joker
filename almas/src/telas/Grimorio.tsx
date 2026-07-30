import { useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Obra } from '../dados/db'
import { salvarObra } from '../dados/acoes'
import { buscar, SemChaveRawg, type Achado } from '../dados/apis'
import { useConfig } from '../estado/hooks'
import { ESTADO_OBRA, TIPO_OBRA, type EstadoObra, type TipoObra } from '../dominio/tipos'
import { Bandeja, Botao, TituloDeTela, Vazio } from '../ui/pecas'
import { ListaVirtual } from '../ui/ListaVirtual'
import { CartaoObra, DetalheObra } from '../ui/obra'

/**
 * Grimório.
 *
 * Estante de anime, livros e jogos. "Largar" é um estado legítimo com o mesmo
 * peso visual dos outros — sem cor de alerta, sem penalidade, sem ficar no fim
 * da fila. A lista é virtualizada porque estante de verdade tem centenas de
 * itens, e busca local é instantânea porque procurar não pode custar espera.
 */

const TIPOS: TipoObra[] = ['anime', 'livro', 'jogo']
const ESTADOS: (EstadoObra | 'todos')[] = ['todos', 'andamento', 'planejado', 'concluido', 'abandonado']

export function Grimorio() {
  const config = useConfig()
  const [tipo, setTipo] = useState<TipoObra>('anime')
  const [estado, setEstado] = useState<EstadoObra | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [aberta, setAberta] = useState<string | null>(null)
  const [adicionando, setAdicionando] = useState(false)

  const obras = useLiveQuery(() => db.obras.where('tipo').equals(tipo).toArray(), [tipo])

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (obras ?? [])
      .filter((o) => (estado === 'todos' ? true : o.estado === estado))
      .filter((o) => (termo ? o.titulo.toLowerCase().includes(termo) : true))
      .sort((a, b) => b.atualizadaEm - a.atualizadaEm)
  }, [obras, estado, busca])

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: obras?.length ?? 0 }
    for (const e of ESTADOS) if (e !== 'todos') c[e] = (obras ?? []).filter((o) => o.estado === e).length
    return c
  }, [obras])

  return (
    <div>
      <TituloDeTela
        acao={
          <Botao peso="brasa" className="h-10 text-[0.82rem]" onClick={() => setAdicionando(true)}>
            + adicionar
          </Botao>
        }
      >
        Grimório
      </TituloDeTela>

      <div className="mb-3 flex gap-1.5">
        {TIPOS.map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`toque flex-1 rounded-lg text-[0.85rem] ${
              tipo === t ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40' : 'bg-pedra text-fraco'
            }`}
          >
            {TIPO_OBRA[t].plural}
          </button>
        ))}
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder={`procurar em ${TIPO_OBRA[tipo].plural.toLowerCase()}…`}
        className="mb-3 w-full rounded-lg bg-pedra px-3 py-2.5 text-[0.92rem] outline-none ring-1 ring-transparent focus:ring-brasa/50"
      />

      <div className="mb-4 flex gap-1.5 overflow-x-auto rolagem-limpa">
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setEstado(e)}
            className={`toque shrink-0 rounded-lg px-3 text-[0.78rem] ${
              estado === e ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40' : 'bg-pedra text-fraco'
            }`}
            style={{ minHeight: 40 }}
          >
            {e === 'todos' ? 'tudo' : ESTADO_OBRA[e].nome.toLowerCase()}{' '}
            <span className="text-tenue">{contagem[e] ?? 0}</span>
          </button>
        ))}
      </div>

      {lista.length > 0 ? (
        <ListaVirtual
          itens={lista}
          colunas={3}
          espaco={12}
          alturaLinha={232}
          render={(o: Obra) => (
            <CartaoObra key={o.id} obra={o} aoAbrir={() => setAberta(o.id)} />
          )}
        />
      ) : (
        <Vazio
          titulo={
            busca
              ? 'Nada com esse nome.'
              : estado === 'abandonado'
                ? 'Você não largou nada ainda.'
                : `Nenhum ${TIPO_OBRA[tipo].nome.toLowerCase()} aqui.`
          }
          dica={
            estado === 'abandonado'
              ? 'Quando largar, vai ficar guardado aqui — sem cobrança. Largar também é escolha.'
              : 'Busque pelo nome e a capa vem junto.'
          }
          acao={
            !busca && (
              <Botao peso="brasa" onClick={() => setAdicionando(true)}>
                buscar {TIPO_OBRA[tipo].nome.toLowerCase()}
              </Botao>
            )
          }
        />
      )}

      <DetalheObra obraId={aberta} aoFechar={() => setAberta(null)} />
      <Adicionar
        aberta={adicionando}
        tipo={tipo}
        chaveRawg={config.chaveRawg}
        aoFechar={() => setAdicionando(false)}
      />
    </div>
  )
}

/* ─────────────────────────── busca externa ───────────────────────────── */

function Adicionar({
  aberta,
  tipo,
  chaveRawg,
  aoFechar,
}: {
  aberta: boolean
  tipo: TipoObra
  chaveRawg?: string
  aoFechar: () => void
}) {
  const [termo, setTermo] = useState('')
  const [achados, setAchados] = useState<Achado[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [manual, setManual] = useState(false)
  const pedido = useRef(0)

  useEffect(() => {
    if (!aberta) {
      setTermo('')
      setAchados([])
      setErro(null)
      setManual(false)
    }
  }, [aberta])

  // Autocomplete com folga: 350ms sem digitar, e resposta atrasada é descartada.
  useEffect(() => {
    const t = termo.trim()
    if (t.length < 2) {
      setAchados([])
      setErro(null)
      return
    }
    const meu = ++pedido.current
    setCarregando(true)
    const atraso = setTimeout(async () => {
      try {
        const r = await buscar(tipo, t, chaveRawg)
        if (meu === pedido.current) {
          setAchados(r)
          setErro(r.length ? null : 'Nada encontrado com esse nome.')
        }
      } catch (e) {
        if (meu === pedido.current) {
          setAchados([])
          setErro(
            e instanceof SemChaveRawg
              ? e.message
              : 'A busca não respondeu. Pode ser a rede — dá pra cadastrar na mão aqui embaixo.',
          )
        }
      } finally {
        if (meu === pedido.current) setCarregando(false)
      }
    }, 350)
    return () => clearTimeout(atraso)
  }, [termo, tipo, chaveRawg])

  async function guardar(a: Achado, estado: EstadoObra) {
    await salvarObra({
      tipo,
      titulo: a.titulo,
      capa: a.capa,
      estado,
      fonte: a.fonte,
      fonteId: a.fonteId,
      autoria: a.autoria,
      ano: a.ano,
      total: a.total,
      sinopse: a.sinopse,
    })
    aoFechar()
  }

  return (
    <Bandeja aberta={aberta} aoFechar={aoFechar} titulo={`Adicionar ${TIPO_OBRA[tipo].nome}`}>
      <input
        autoFocus
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder={`nome do ${TIPO_OBRA[tipo].nome.toLowerCase()}…`}
        className="w-full rounded-lg bg-pedra-alta px-3 py-3 text-[1rem] outline-none ring-1 ring-transparent focus:ring-brasa/50"
        autoComplete="off"
      />

      {carregando && <p className="mt-3 text-[0.8rem] text-tenue">procurando…</p>}
      {erro && !carregando && <p className="mt-3 text-[0.82rem] leading-relaxed text-fraco">{erro}</p>}

      <ul className="mt-3 space-y-1.5">
        {achados.map((a) => (
          <li key={`${a.fonte}-${a.fonteId}`}>
            <div className="flex items-center gap-3 rounded-lg bg-pedra-alta p-2">
              {a.capa ? (
                <img src={a.capa} alt="" className="h-16 w-11 shrink-0 rounded object-cover" />
              ) : (
                <div className="h-16 w-11 shrink-0 rounded bg-pedra" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.92rem]">{a.titulo}</p>
                <p className="truncate text-[0.72rem] text-tenue">
                  {[a.autoria, a.ano, a.total ? `${a.total} ${TIPO_OBRA[tipo].unidade}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <div className="mt-1.5 flex gap-1.5">
                  <Botao
                    peso="brasa"
                    className="h-9 min-h-0 px-2.5 text-[0.75rem]"
                    onClick={() => void guardar(a, 'andamento')}
                  >
                    comecei
                  </Botao>
                  <Botao
                    peso="pedra"
                    className="h-9 min-h-0 px-2.5 text-[0.75rem]"
                    onClick={() => void guardar(a, 'planejado')}
                  >
                    fila
                  </Botao>
                  <Botao
                    peso="pedra"
                    className="h-9 min-h-0 px-2.5 text-[0.75rem]"
                    onClick={() => void guardar(a, 'concluido')}
                  >
                    já terminei
                  </Botao>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-limite pt-4">
        {manual ? (
          <Manual tipo={tipo} aoGuardar={aoFechar} tituloInicial={termo} />
        ) : (
          <button
            onClick={() => setManual(true)}
            className="toque area-toque text-[0.8rem] text-tenue hover:text-texto"
          >
            não achou? cadastrar na mão
          </button>
        )}
      </div>
    </Bandeja>
  )
}

function Manual({
  tipo,
  tituloInicial,
  aoGuardar,
}: {
  tipo: TipoObra
  tituloInicial: string
  aoGuardar: () => void
}) {
  const [titulo, setTitulo] = useState(tituloInicial)
  const [capa, setCapa] = useState('')
  const [total, setTotal] = useState('')

  return (
    <div className="space-y-2">
      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="título"
        className="w-full rounded-lg bg-pedra-alta px-3 py-2.5 outline-none ring-1 ring-transparent focus:ring-brasa/50"
      />
      <div className="flex gap-2">
        <input
          value={capa}
          onChange={(e) => setCapa(e.target.value)}
          placeholder="url da capa (opcional)"
          className="min-w-0 flex-1 rounded-lg bg-pedra-alta px-3 py-2.5 text-[0.85rem] outline-none ring-1 ring-transparent focus:ring-brasa/50"
        />
        <input
          value={total}
          onChange={(e) => setTotal(e.target.value.replace(/\D/g, ''))}
          placeholder={TIPO_OBRA[tipo].unidade}
          inputMode="numeric"
          className="w-20 rounded-lg bg-pedra-alta px-3 py-2.5 text-[0.85rem] outline-none ring-1 ring-transparent focus:ring-brasa/50"
        />
      </div>
      <Botao
        peso="brasa"
        className="h-11 w-full"
        disabled={!titulo.trim()}
        onClick={async () => {
          await salvarObra({
            tipo,
            titulo: titulo.trim(),
            capa: capa.trim() || undefined,
            estado: 'andamento',
            fonte: 'manual',
            total: total ? Number(total) : tipo === 'jogo' ? 100 : undefined,
          })
          aoGuardar()
        }}
      >
        guardar na estante
      </Botao>
    </div>
  )
}
