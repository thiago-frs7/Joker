import { useEffect, useMemo, useRef, useState } from 'react'
import { capturar, palpiteDeAtributo } from '../dominio/captura'
import { ATRIBUTO, ATRIBUTOS, ENERGIA, ORDEM_ENERGIA, type AtributoId, type Energia } from '../dominio/tipos'
import { criarMissao } from '../dados/acoes'
import { Bandeja, Botao, Etiqueta, TracosEnergia, TrilhoDePrazo } from './pecas'
import type { Missao } from '../dados/db'

/**
 * Captura em menos de 3 segundos.
 *
 * Um campo. Enter salva e **continua aberto** — despejar cinco coisas seguidas é
 * o caso real, não a exceção. Categorizar é opcional e fica depois. O que o
 * parser entendeu aparece como etiqueta na hora: nada de estado invisível.
 */

export function Captura({
  aberta,
  aoFechar,
  energiaPadrao,
  aoCriar,
}: {
  aberta: boolean
  aoFechar: () => void
  energiaPadrao: Energia
  aoCriar?: (m: Missao) => void
}) {
  const [texto, setTexto] = useState('')
  const [energia, setEnergia] = useState<Energia | null>(null)
  const [atributo, setAtributo] = useState<AtributoId | null>(null)
  const [recentes, setRecentes] = useState<Missao[]>([])
  const campoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (aberta) {
      setRecentes([])
      // Sem atraso: o cursor já está no campo quando a bandeja aparece.
      requestAnimationFrame(() => campoRef.current?.focus())
    } else {
      setTexto('')
      setEnergia(null)
      setAtributo(null)
    }
  }, [aberta])

  const lido = useMemo(() => capturar(texto), [texto])
  const atributoFinal = atributo ?? lido.atributo ?? (texto.trim() ? palpiteDeAtributo(lido.titulo) : null)
  const energiaFinal = energia ?? lido.energia ?? energiaPadrao

  async function salvar() {
    if (!lido.titulo.trim()) return
    const m = await criarMissao(
      { ...lido, atributo: atributoFinal ?? undefined, energia: energiaFinal },
      { energia: energiaPadrao },
    )
    if (m) {
      setRecentes((r) => [m, ...r].slice(0, 5))
      aoCriar?.(m)
    }
    setTexto('')
    setAtributo(null)
    setEnergia(null)
    campoRef.current?.focus()
  }

  return (
    <Bandeja
      aberta={aberta}
      aoFechar={aoFechar}
      titulo="Nova missão"
      rodape={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.7rem] text-tenue">
            Enter salva e continua · Esc fecha
          </span>
          <Botao peso="brasa" onClick={() => void salvar()} disabled={!lido.titulo.trim()}>
            Guardar
          </Botao>
        </div>
      }
    >
      <input
        ref={campoRef}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            void salvar()
          }
        }}
        placeholder="o que precisa sair da sua cabeça?"
        className="w-full rounded-xl bg-pedra-alta px-4 py-3.5 text-[1.05rem] outline-none ring-1 ring-transparent focus:ring-brasa/60"
        enterKeyHint="done"
        autoComplete="off"
        aria-label="Título da missão"
      />

      {/* o que o parser entendeu — visível, sempre */}
      {(lido.prazo || lido.primeiroPasso || lido.reconhecido.length > 0) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {lido.prazo && <TrilhoDePrazo prazo={lido.prazo} />}
          {lido.primeiroPasso && (
            <Etiqueta ativa>começa por: {lido.primeiroPasso}</Etiqueta>
          )}
        </div>
      )}

      <p className="mt-3 text-[0.72rem] leading-relaxed text-tenue">
        Opcional: <b className="text-fraco">amanhã</b>, <b className="text-fraco">sexta</b>,{' '}
        <b className="text-fraco">em 3 dias</b> viram prazo · <b className="text-fraco">#corpo</b>{' '}
        vira atributo · <b className="text-fraco">{'>'}</b> separa o primeiro passo de 2 minutos.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">
            Energia que isso pede
          </p>
          <div className="flex gap-2">
            {ORDEM_ENERGIA.map((e) => (
              <button
                key={e}
                onClick={() => setEnergia(e)}
                className={`toque flex flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm ${
                  energiaFinal === e ? 'bg-brasa/15 text-brasa ring-1 ring-brasa/40' : 'bg-pedra-alta text-fraco'
                }`}
              >
                <TracosEnergia energia={e} />
                {ENERGIA[e].nome}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">
            Atributo {atributoFinal && !atributo && !lido.atributo && '(chute do app — troque se quiser)'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ATRIBUTOS.map((a) => (
              <button
                key={a}
                onClick={() => setAtributo(a)}
                className={`toque min-h-0 rounded-lg px-2.5 py-1.5 text-[0.78rem] ${
                  atributoFinal === a
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

      {recentes.length > 0 && (
        <div className="mt-5 border-t border-limite pt-3">
          <p className="mb-2 text-[0.68rem] uppercase tracking-[0.16em] text-tenue">
            acabou de entrar
          </p>
          <ul className="space-y-1.5">
            {recentes.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-sm text-fraco">
                <span className="text-brasa">✓</span>
                <span className="truncate">{m.primeiroPasso || m.titulo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Bandeja>
  )
}
