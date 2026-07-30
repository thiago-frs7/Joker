import { useCallback, useEffect, useState } from 'react'
import { BarraDeAlmas } from './ui/BarraDeAlmas'
import { Captura } from './ui/Captura'
import { Nucleo } from './telas/Nucleo'
import { Missoes } from './telas/Missoes'
import { Grimorio } from './telas/Grimorio'
import { Ascensao } from './telas/Ascensao'
import { Trofeus } from './telas/Trofeus'
import { Ajustes } from './telas/Ajustes'
import { useAtalho, useConfig, usePerfil } from './estado/hooks'
import { precisaBackup } from './dados/backup'
import { AvisoTrofeu } from './ui/AvisoTrofeu'
import { ICONE_ABA } from './ui/icones'

/**
 * Navegação de dois níveis, no máximo: a barra embaixo é o nível 1, as bandejas
 * são o nível 2. Não existe menu dentro de menu em lugar nenhum do app.
 */

function abaDaUrl(): string {
  const h = location.hash.replace('#', '')
  return h in ICONE_ABA ? h : 'nucleo'
}

export function App() {
  const config = useConfig()
  const perfil = usePerfil()
  const [aba, setAba] = useState(abaDaUrl)
  const [capturando, setCapturando] = useState(false)

  useEffect(() => {
    const ouvir = () => setAba(abaDaUrl())
    window.addEventListener('hashchange', ouvir)
    return () => window.removeEventListener('hashchange', ouvir)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.calmo = config.modoCalmo ? 'sim' : 'nao'
  }, [config.modoCalmo])

  const irPara = useCallback((destino: string) => {
    location.hash = destino
    setAba(destino)
    window.scrollTo({ top: 0 })
  }, [])

  const abrirCaptura = useCallback(() => setCapturando(true), [])

  useAtalho('n', abrirCaptura, !capturando)
  useAtalho('a', abrirCaptura, !capturando)
  useEffect(() => {
    const ouvir = () => setCapturando(true)
    window.addEventListener('almas:capturar', ouvir)
    return () => window.removeEventListener('almas:capturar', ouvir)
  }, [])

  const visiveis = config.abas.filter((a) => !a.oculta)
  const abaAtiva = visiveis.some((a) => a.id === aba) ? aba : (visiveis[0]?.id ?? 'nucleo')

  return (
    <div className="relative min-h-dvh">
      <BarraDeAlmas />

      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-36 pt-[5.6rem]">
        {precisaBackup(perfil, config.lembreteBackupDias) && abaAtiva !== 'ajustes' && (
          <button
            onClick={() => irPara('ajustes')}
            className="mb-3 flex w-full items-center gap-2.5 rounded-xl bg-pedra-alta px-3 py-2.5 text-left text-[0.8rem] text-fraco hover:bg-pedra-viva"
          >
            <span className="text-brasa">⤓</span>
            <span className="flex-1">
              Faz um mês que você não salva um backup. Seus dados vivem só neste navegador.
            </span>
            <span className="text-tenue">abrir</span>
          </button>
        )}

        {abaAtiva === 'nucleo' && <Nucleo irPara={irPara} />}
        {abaAtiva === 'missoes' && <Missoes />}
        {abaAtiva === 'grimorio' && <Grimorio />}
        {abaAtiva === 'ascensao' && <Ascensao />}
        {abaAtiva === 'trofeus' && <Trofeus />}
        {abaAtiva === 'ajustes' && <Ajustes />}
      </main>

      {/* Captura sempre ao alcance do polegar, em qualquer tela. */}
      <button
        onClick={abrirCaptura}
        aria-label="Nova missão"
        className="botao-captura fixed bottom-[calc(4.6rem+env(safe-area-inset-bottom))] right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-brasa text-cripta shadow-[0_6px_24px_rgba(232,163,61,0.32)] transition-transform duration-100 hover:bg-brasa-clara active:scale-95"
      >
        <span className="text-2xl leading-none">+</span>
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-limite bg-cripta/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {visiveis.map((a) => {
            const ativa = a.id === abaAtiva
            const Icone = ICONE_ABA[a.id] ?? ICONE_ABA.nucleo
            return (
              <button
                key={a.id}
                onClick={() => irPara(a.id)}
                aria-current={ativa ? 'page' : undefined}
                className={`toque flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.58rem] uppercase tracking-[0.08em] ${
                  ativa ? 'text-brasa' : 'text-tenue hover:text-fraco'
                }`}
              >
                <Icone tamanho={21} />
                <span className="max-w-full truncate">{a.nome}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <Captura
        aberta={capturando}
        aoFechar={() => setCapturando(false)}
        energiaPadrao={config.energiaAtual}
      />
      <AvisoTrofeu />
    </div>
  )
}
