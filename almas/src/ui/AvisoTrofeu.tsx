import { useEffect, useState } from 'react'
import { canalTrofeu } from '../dados/pulso'
import { trofeuPorId, type Trofeu } from '../dominio/trofeus'

/** Troféu não pode chegar em silêncio — mas também não pode roubar a tela. */
export function AvisoTrofeu() {
  const [fila, setFila] = useState<Trofeu[]>([])

  useEffect(() => {
    return canalTrofeu.ouvir(({ id }) => {
      const t = trofeuPorId.get(id)
      if (!t) return
      setFila((f) => [...f, t])
      setTimeout(() => setFila((f) => f.slice(1)), 4200)
    })
  }, [])

  if (!fila.length) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[4.8rem] z-[70] flex flex-col items-center gap-2 px-4">
      {fila.slice(0, 2).map((t, i) => (
        <div
          key={`${t.id}-${i}`}
          className="anima-entrar flex w-full max-w-sm items-center gap-3 rounded-xl bg-pedra-alta px-3.5 py-3 ring-1 ring-brasa/35 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brasa/15 text-[1.15rem] text-brasa">
            {t.glifo}
          </span>
          <div className="min-w-0">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-brasa">troféu</p>
            <p className="truncate font-semibold text-texto">{t.nome}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
