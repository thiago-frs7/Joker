import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../dados/db'
import { definirEnergiaAtual, sortearMissao } from '../dados/acoes'
import { useConfig } from '../estado/hooks'
import { DetalheMissao, LinhaMissao, useMissoesAbertas } from '../ui/missao'
import { Botao, TituloDeTela, TracosEnergia, Vazio } from '../ui/pecas'
import { IconeDado } from '../ui/icones'
import { ENERGIA, ORDEM_ENERGIA, type Energia } from '../dominio/tipos'
import { hoje } from '../dominio/captura'

/**
 * A lista longa. Fica atrás de um toque explícito, nunca no Núcleo.
 *
 * O filtro principal não é por projeto nem por data — é por *energia disponível*,
 * porque essa é a pergunta real: "o que eu consigo fazer agora?".
 */

type Recorte = 'tudo' | 'energia' | 'hoje' | 'feitas'

export function Missoes() {
  const config = useConfig()
  const abertas = useMissoesAbertas()
  const [recorte, setRecorte] = useState<Recorte>('tudo')
  const [aberta, setAberta] = useState<string | null>(null)

  const feitas = useLiveQuery(
    () =>
      db.missoes
        .filter((m) => !!m.concluidaEm)
        .reverse()
        .sortBy('concluidaEm'),
    [],
  )

  const lista = useMemo(() => {
    if (recorte === 'feitas') return (feitas ?? []).slice().reverse().slice(0, 120)
    if (recorte === 'hoje')
      return abertas.filter((m) => m.prazo !== undefined && m.prazo <= hoje())
    if (recorte === 'energia') {
      const teto = ORDEM_ENERGIA.indexOf(config.energiaAtual)
      return abertas.filter((m) => ORDEM_ENERGIA.indexOf(m.energia) <= teto)
    }
    return abertas
  }, [recorte, abertas, feitas, config.energiaAtual])

  return (
    <div>
      <TituloDeTela
        acao={
          <Botao
            peso="brasa"
            className="h-10 text-[0.82rem]"
            onClick={() => void sortearMissao(config.energiaAtual)}
          >
            <IconeDado tamanho={17} /> me dá uma
          </Botao>
        }
      >
        Missões
      </TituloDeTela>

      <div className="mb-3 flex gap-1.5 overflow-x-auto rolagem-limpa">
        <Recorte atual={recorte} valor="tudo" ao={setRecorte}>
          tudo ({abertas.length})
        </Recorte>
        <Recorte atual={recorte} valor="energia" ao={setRecorte}>
          consigo agora
        </Recorte>
        <Recorte atual={recorte} valor="hoje" ao={setRecorte}>
          pra hoje
        </Recorte>
        <Recorte atual={recorte} valor="feitas" ao={setRecorte}>
          feitas
        </Recorte>
      </div>

      {recorte === 'energia' && (
        <div className="superficie mb-3 p-3">
          <p className="mb-2 text-[0.7rem] text-fraco">
            O que eu consigo fazer agora com <b className="text-texto">{ENERGIA[config.energiaAtual].nome.toLowerCase()}</b> energia:
          </p>
          <div className="flex gap-2">
            {ORDEM_ENERGIA.map((e) => (
              <button
                key={e}
                onClick={() => void definirEnergiaAtual(e as Energia)}
                className={`toque flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[0.78rem] ${
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
      )}

      <div className="space-y-2">
        {lista.map((m) => (
          <LinhaMissao key={m.id} missao={m} aoAbrir={() => setAberta(m.id)} />
        ))}
      </div>

      {lista.length === 0 && (
        <Vazio
          titulo={
            recorte === 'feitas'
              ? 'Nada concluído ainda.'
              : recorte === 'energia'
                ? 'Nada nesse nível de energia.'
                : recorte === 'hoje'
                  ? 'Nada marcado pra hoje. Isso é uma boa notícia.'
                  : 'Lista limpa.'
          }
          dica={
            recorte === 'energia'
              ? 'Sobe a energia no seletor acima ou joga uma missão pequena aqui dentro.'
              : 'O botão + está sempre no canto. Não precisa organizar nada agora.'
          }
        />
      )}

      {recorte === 'feitas' && lista.length > 0 && (
        <p className="mt-4 text-center text-[0.72rem] text-tenue">
          Tudo que você já fez continua aqui. Nada é retirado.
        </p>
      )}

      <DetalheMissao missaoId={aberta} aoFechar={() => setAberta(null)} />
    </div>
  )
}

function Recorte({
  atual,
  valor,
  ao,
  children,
}: {
  atual: string
  valor: Recorte
  ao: (v: Recorte) => void
  children: React.ReactNode
}) {
  const ativa = atual === valor
  return (
    <button
      onClick={() => ao(valor)}
      className={`toque shrink-0 rounded-lg px-3 text-[0.8rem] ${
        ativa ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40' : 'bg-pedra text-fraco hover:text-texto'
      }`}
      style={{ minHeight: 40 }}
    >
      {children}
    </button>
  )
}
