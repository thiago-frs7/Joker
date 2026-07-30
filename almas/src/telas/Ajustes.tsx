import { useRef, useState } from 'react'
import { db, type Aba } from '../dados/db'
import { useConfig, usePerfil } from '../estado/hooks'
import { diasDesde, exportarArquivo, lerBackup, resumir, restaurar, type Backup } from '../dados/backup'
import { Bandeja, Botao, TituloDeTela } from '../ui/pecas'
import { ICONE_ABA } from '../ui/icones'

/**
 * Ajustes.
 *
 * Duas coisas mandam aqui: o usuário pode mudar a forma do app (renomear,
 * reordenar e esconder abas) e o usuário pode levar os dados embora. O resto
 * são interruptores à vista, não preferências enterradas.
 */

export function Ajustes() {
  const config = useConfig()
  const perfil = usePerfil()

  return (
    <div className="space-y-6">
      <TituloDeTela>Ajustes</TituloDeTela>

      <Dados />

      <Secao titulo="Modo calmo" legenda="para dias de sobrecarga">
        <Interruptor
          ligado={config.modoCalmo}
          aoMudar={(v) => void db.config.update(1, { modoCalmo: v })}
          rotulo="Baixar o volume do app"
          detalhe="Some com as animações, apaga o brilho da brasa e afrouxa a densidade. Nenhuma função é escondida — o app só para de gritar."
        />
        <p className="mt-3 text-[0.72rem] leading-relaxed text-tenue">
          Se o seu sistema já pede menos movimento (prefers-reduced-motion), o app respeita
          sozinho, mesmo com este interruptor desligado.
        </p>
      </Secao>

      <Secao titulo="Navegação" legenda="renomeie, reordene, esconda">
        <Abas abas={config.abas} />
      </Secao>

      <Secao titulo="Atalhos" legenda="pra quando digitar é mais rápido que apontar">
        <ul className="space-y-2 text-[0.85rem]">
          {[
            ['N', 'abre a captura de missão, de qualquer tela'],
            ['A', 'a mesma coisa — o que a sua mão alcançar primeiro'],
            ['Enter', 'salva e mantém o campo aberto, pra despejar em sequência'],
            ['Esc', 'fecha o que estiver aberto'],
            ['>', 'no meio do texto, separa o primeiro passo de 2 minutos'],
          ].map(([tecla, oque]) => (
            <li key={tecla} className="flex items-baseline gap-3">
              <kbd className="min-w-12 rounded bg-pedra-alta px-2 py-1 text-center font-mono text-[0.78rem] text-brasa">
                {tecla}
              </kbd>
              <span className="text-fraco">{oque}</span>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Grimório" legenda="busca de jogos">
        <ChaveRawg valor={config.chaveRawg ?? ''} />
      </Secao>

      <Secao titulo="Sobre" legenda="">
        <div className="space-y-1.5 text-[0.82rem] text-fraco">
          <p>
            <b className="text-texto">ALMAS</b> · camada {perfil.nivelVisto} ·{' '}
            {perfil.almas.toLocaleString('pt-BR')} almas acumuladas
          </p>
          <p className="leading-relaxed text-tenue">
            Você começou a acumular há {diasDesde(perfil.criadoEm)} dias. Nada disso é retirado:
            não existe função no app que reduza Almas, camada ou momentum.
          </p>
        </div>
      </Secao>
    </div>
  )
}

/* ──────────────────────────── dados ──────────────────────────────────── */

function Dados() {
  const perfil = usePerfil()
  const entradaRef = useRef<HTMLInputElement>(null)
  const [pendente, setPendente] = useState<Backup | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  const dias = diasDesde(perfil.ultimoBackup)

  async function escolherArquivo(arquivo: File) {
    setErro(null)
    try {
      setPendente(lerBackup(await arquivo.text()))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui ler esse arquivo.')
    }
  }

  return (
    <section className="superficie overflow-hidden">
      <div className="border-b border-limite bg-brasa/8 px-4 py-3">
        <p className="text-[0.82rem] leading-relaxed text-fraco">
          <b className="text-texto">Seus dados vivem só neste navegador.</b> Nada vai para servidor
          nenhum — ótimo pra privacidade, cruel com descuido. Limpar os dados do site, trocar de
          aparelho ou usar aba anônima faz tudo sumir. O arquivo JSON é o seu único cofre.
        </p>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Botao
            peso="brasa"
            className="h-12 flex-1"
            onClick={async () => {
              await exportarArquivo()
              setSalvo(true)
              setTimeout(() => setSalvo(false), 2400)
            }}
          >
            {salvo ? '✓ arquivo salvo' : 'exportar tudo'}
          </Botao>
          <Botao peso="pedra" className="h-12 flex-1" onClick={() => entradaRef.current?.click()}>
            importar JSON
          </Botao>
          <input
            ref={entradaRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void escolherArquivo(f)
              e.target.value = ''
            }}
          />
        </div>

        <p className="text-[0.75rem] leading-relaxed text-tenue">
          {dias === 0
            ? 'Backup salvo hoje. Pode respirar.'
            : dias === 1
              ? 'Último backup: ontem.'
              : `Último backup: há ${dias} dias.`}{' '}
          O app lembra de novo a cada 30 dias — e essa é a única coisa que ele cobra de você.
        </p>

        {erro && <p className="text-[0.8rem] text-brasa">{erro}</p>}
      </div>

      <Bandeja
        aberta={!!pendente}
        aoFechar={() => setPendente(null)}
        titulo="Importar backup"
        rodape={
          <div className="flex gap-2">
            <Botao peso="fantasma" className="flex-1" onClick={() => setPendente(null)}>
              cancelar
            </Botao>
            <Botao
              peso="brasa"
              className="flex-1"
              onClick={async () => {
                if (pendente) await restaurar(pendente)
                setPendente(null)
                location.reload()
              }}
            >
              substituir tudo
            </Botao>
          </div>
        }
      >
        {pendente && (
          <div className="space-y-3">
            <p className="text-fraco">
              Este arquivo é de{' '}
              <b className="text-texto">
                {new Date(resumir(pendente).exportadoEm).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </b>{' '}
              e traz:
            </p>
            <ul className="space-y-1 text-[0.9rem] text-fraco">
              <li>· {resumir(pendente).almas.toLocaleString('pt-BR')} almas</li>
              <li>· {resumir(pendente).missoes} missões</li>
              <li>· {resumir(pendente).obras} obras no Grimório</li>
              <li>· {resumir(pendente).trofeus} troféus</li>
            </ul>
            <p className="rounded-lg bg-pedra-alta px-3 py-2.5 text-[0.82rem] leading-relaxed text-fraco">
              Importar <b className="text-texto">substitui</b> o que está aqui agora. Se o que está
              no app hoje ainda importa, exporte antes.
            </p>
          </div>
        )}
      </Bandeja>
    </section>
  )
}

/* ──────────────────────────── abas ───────────────────────────────────── */

function Abas({ abas }: { abas: Aba[] }) {
  async function salvar(novas: Aba[]) {
    await db.config.update(1, { abas: novas })
  }

  function mover(i: number, delta: number) {
    const j = i + delta
    if (j < 0 || j >= abas.length) return
    const copia = [...abas]
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
    void salvar(copia)
  }

  const visiveis = abas.filter((a) => !a.oculta).length

  return (
    <ul className="space-y-1.5">
      {abas.map((a, i) => {
        const Icone = ICONE_ABA[a.id] ?? ICONE_ABA.nucleo
        const ultimaVisivel = visiveis === 1 && !a.oculta
        return (
          <li key={a.id} className="flex items-center gap-1 rounded-lg bg-pedra-alta px-2 py-1.5">
            <span className={a.oculta ? 'text-tenue' : 'text-brasa'}>
              <Icone tamanho={18} />
            </span>
            <input
              value={a.nome}
              onChange={(e) =>
                void salvar(abas.map((x) => (x.id === a.id ? { ...x, nome: e.target.value } : x)))
              }
              className={`min-w-0 flex-1 rounded bg-transparent px-2 py-1.5 text-[0.9rem] outline-none focus:bg-pedra ${
                a.oculta ? 'text-tenue line-through' : ''
              }`}
              aria-label={`Nome da aba ${a.nome}`}
            />
            <button
              onClick={() => mover(i, -1)}
              disabled={i === 0}
              aria-label={`Subir ${a.nome}`}
              className="toque min-w-0 px-2 text-tenue hover:text-texto disabled:opacity-25"
            >
              ↑
            </button>
            <button
              onClick={() => mover(i, 1)}
              disabled={i === abas.length - 1}
              aria-label={`Descer ${a.nome}`}
              className="toque min-w-0 px-2 text-tenue hover:text-texto disabled:opacity-25"
            >
              ↓
            </button>
            <button
              onClick={() =>
                void salvar(abas.map((x) => (x.id === a.id ? { ...x, oculta: !x.oculta } : x)))
              }
              disabled={ultimaVisivel}
              aria-label={a.oculta ? `Mostrar ${a.nome}` : `Esconder ${a.nome}`}
              className="toque min-w-0 px-2 text-[0.72rem] text-tenue hover:text-texto disabled:opacity-25"
            >
              {a.oculta ? 'mostrar' : 'esconder'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ──────────────────────────── peças locais ───────────────────────────── */

function Secao({
  titulo,
  legenda,
  children,
}: {
  titulo: string
  legenda: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2 px-1">
        <h2 className="text-[0.68rem] uppercase tracking-[0.24em] text-fraco">{titulo}</h2>
        {legenda && <span className="text-[0.7rem] text-tenue">{legenda}</span>}
      </div>
      <div className="superficie p-4">{children}</div>
    </section>
  )
}

function Interruptor({
  ligado,
  aoMudar,
  rotulo,
  detalhe,
}: {
  ligado: boolean
  aoMudar: (v: boolean) => void
  rotulo: string
  detalhe: string
}) {
  return (
    <button
      role="switch"
      aria-checked={ligado}
      onClick={() => aoMudar(!ligado)}
      className="flex w-full items-start gap-3 text-left"
    >
      <span
        className={`mt-0.5 flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-150 ${
          ligado ? 'bg-brasa' : 'bg-pedra-viva'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-cripta transition-transform duration-150 ${
            ligado ? 'translate-x-5' : ''
          }`}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.95rem] text-texto">{rotulo}</span>
        <span className="mt-0.5 block text-[0.78rem] leading-relaxed text-tenue">{detalhe}</span>
      </span>
    </button>
  )
}

function ChaveRawg({ valor }: { valor: string }) {
  const [texto, setTexto] = useState(valor)
  return (
    <div>
      <label className="mb-1.5 block text-[0.8rem] text-fraco">
        Chave da API RAWG <span className="text-tenue">(opcional)</span>
      </label>
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={() => void db.config.update(1, { chaveRawg: texto.trim() || undefined })}
        placeholder="cole aqui a sua chave"
        className="w-full rounded-lg bg-pedra-alta px-3 py-2.5 font-mono text-[0.85rem] outline-none ring-1 ring-transparent focus:ring-brasa/50"
        autoComplete="off"
        spellCheck={false}
      />
      <p className="mt-2 text-[0.75rem] leading-relaxed text-tenue">
        Anime (Jikan) e livros (Google Books) buscam sem chave nenhuma. Jogos são o único caso em
        que a RAWG exige uma — a sua sai de graça em rawg.io/apidocs. Sem chave o Grimório continua
        inteiro: você cadastra o jogo na mão, com capa por URL.
      </p>
    </div>
  )
}
