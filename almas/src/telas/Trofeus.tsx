import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Obra } from '../dados/db'
import { usePerfil, useMomentum } from '../estado/hooks'
import { GRUPO_TROFEU, TROFEUS, type ContextoTrofeu, type Trofeu } from '../dominio/trofeus'
import { nivelDeAlmas } from '../dominio/progressao'
import { Aro, TituloDeTela } from '../ui/pecas'
import { Capa, DetalheObra } from '../ui/obra'

/**
 * Troféus.
 *
 * Bloqueado fica visível, com a condição escrita e a barra mostrando o quanto
 * falta — curiosidade é combustível, e saber que faltam 2 é diferente de saber
 * que "ainda não". Nenhuma conquista aqui exige constância sem falha.
 */

export function Trofeus() {
  const perfil = usePerfil()
  const momentum = useMomentum(perfil)
  const ganhos = useLiveQuery(() => db.trofeus.toArray(), [])
  const obras = useLiveQuery(() => db.obras.where('tipo').equals('jogo').toArray(), [])
  const [aberta, setAberta] = useState<string | null>(null)

  const contagemObras = useLiveQuery(async () => {
    const [anime, livro, jogo, total] = await Promise.all([
      db.obras.where({ tipo: 'anime', estado: 'concluido' }).count(),
      db.obras.where({ tipo: 'livro', estado: 'concluido' }).count(),
      db.obras.where({ tipo: 'jogo', estado: 'concluido' }).count(),
      db.obras.count(),
    ])
    return { anime, livro, jogo, total }
  }, [])

  const ctx: ContextoTrofeu = useMemo(
    () => ({
      contadores: perfil.contadores,
      nivel: nivelDeAlmas(perfil.almas),
      momentum,
      atributos: perfil.atributos,
      obrasPorTipo: {
        anime: contagemObras?.anime ?? 0,
        livro: contagemObras?.livro ?? 0,
        jogo: contagemObras?.jogo ?? 0,
      },
      obrasNoGrimorio: contagemObras?.total ?? 0,
    }),
    [perfil, momentum, contagemObras],
  )

  const datas = useMemo(
    () => new Map((ganhos ?? []).map((g) => [g.id, g.ganhoEm])),
    [ganhos],
  )
  const conquistados = datas.size

  const jogos = useMemo(
    () =>
      (obras ?? [])
        .filter((j) => j.platina || (j.percentualTrofeus ?? 0) > 0 || (j.desafios?.length ?? 0) > 0)
        .sort((a, b) => (b.percentualTrofeus ?? 0) - (a.percentualTrofeus ?? 0)),
    [obras],
  )

  return (
    <div>
      <TituloDeTela>Troféus</TituloDeTela>

      <section className="superficie mb-5 flex items-center gap-4 p-4">
        <Aro fracao={conquistados / TROFEUS.length} tamanho={68} grossura={6}>
          <span className="numeral text-[1.3rem] text-brasa">{conquistados}</span>
        </Aro>
        <div className="min-w-0">
          <p className="text-[0.95rem] text-texto">
            {conquistados} de {TROFEUS.length} conquistados
          </p>
          <p className="mt-0.5 text-[0.78rem] leading-relaxed text-tenue">
            Nenhum deles expira, nenhum pede dias seguidos. O que está bloqueado mostra a condição
            — e o quanto falta.
          </p>
        </div>
      </section>

      {jogos.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 px-1 text-[0.66rem] uppercase tracking-[0.28em] text-tenue">
            platinas e desafios
          </h2>
          <div className="flex gap-2.5 overflow-x-auto rolagem-limpa pb-1">
            {jogos.map((j) => (
              <CartaoJogo key={j.id} jogo={j} aoAbrir={() => setAberta(j.id)} />
            ))}
          </div>
        </section>
      )}

      {(Object.keys(GRUPO_TROFEU) as (keyof typeof GRUPO_TROFEU)[]).map((grupo) => {
        const doGrupo = TROFEUS.filter((t) => t.grupo === grupo)
        return (
          <section key={grupo} className="mb-6">
            <div className="mb-2 flex items-baseline gap-2 px-1">
              <h2 className="text-[0.66rem] uppercase tracking-[0.28em] text-fraco">
                {GRUPO_TROFEU[grupo].nome}
              </h2>
              <span className="text-[0.7rem] text-tenue">{GRUPO_TROFEU[grupo].legenda}</span>
            </div>
            <div className="space-y-2">
              {doGrupo.map((t) => (
                <CartaoTrofeu key={t.id} trofeu={t} ctx={ctx} ganhoEm={datas.get(t.id)} />
              ))}
            </div>
          </section>
        )
      })}

      <DetalheObra obraId={aberta} aoFechar={() => setAberta(null)} />
    </div>
  )
}

function CartaoTrofeu({
  trofeu,
  ctx,
  ganhoEm,
}: {
  trofeu: Trofeu
  ctx: ContextoTrofeu
  ganhoEm?: number
}) {
  const { atual, alvo } = trofeu.medir(ctx)
  const feito = !!ganhoEm
  const fracao = alvo > 0 ? Math.min(1, atual / alvo) : 0

  return (
    <article
      className={`superficie flex items-start gap-3 p-3 ${feito ? 'ring-1 ring-brasa/25' : ''}`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[1.15rem] ${
          feito ? 'bg-brasa/15 text-brasa' : 'bg-pedra-alta text-tenue'
        }`}
      >
        {trofeu.glifo}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className={`text-[0.98rem] ${feito ? 'text-texto' : 'text-fraco'}`}>{trofeu.nome}</h3>
          {feito ? (
            <span className="shrink-0 text-[0.68rem] text-tenue">
              {new Date(ganhoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          ) : (
            <span className="numeral shrink-0 text-[0.75rem] text-tenue">
              {atual}/{alvo}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[0.78rem] leading-relaxed text-tenue">{trofeu.condicao}</p>
        {!feito && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-pedra-alta">
            <div
              className="h-full rounded-full bg-brasa/70 transition-[width] duration-500"
              style={{ width: `${fracao * 100}%` }}
            />
          </div>
        )}
      </div>
    </article>
  )
}

function CartaoJogo({ jogo, aoAbrir }: { jogo: Obra; aoAbrir: () => void }) {
  const feitos = (jogo.desafios ?? []).filter((d) => d.feito).length
  const pct = jogo.percentualTrofeus ?? 0
  return (
    <button
      onClick={aoAbrir}
      className="superficie w-36 shrink-0 overflow-hidden text-left"
    >
      <div className="relative h-24 w-full">
        <Capa obra={jogo} className="h-full w-full" />
        {jogo.platina && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-cripta/85 px-1.5 py-0.5 text-[0.62rem] text-brasa">
            ◆ platina
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-[0.78rem] leading-tight text-fraco">{jogo.titulo}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-pedra-alta">
            <div className="h-full rounded-full bg-brasa" style={{ width: `${pct}%` }} />
          </div>
          <span className="numeral text-[0.7rem] text-brasa">{pct}%</span>
        </div>
        {(jogo.desafios?.length ?? 0) > 0 && (
          <p className="mt-1 text-[0.68rem] text-tenue">
            {feitos}/{jogo.desafios!.length} desafios seus
          </p>
        )}
      </div>
    </button>
  )
}
