import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './estilo.css'
import { App } from './App'
import { garantirBase } from './dados/db'
import { conferirTrofeus } from './dados/acoes'

registerSW({ immediate: true })

await garantirBase()

// Reconcilia troféus na abertura: depois de importar um backup (ou de fechar o
// app no meio de uma ação), o que já foi conquistado tem que estar conquistado.
void conferirTrofeus()

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
