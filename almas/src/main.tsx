import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './estilo.css'
import { App } from './App'
import { garantirBase } from './dados/db'

registerSW({ immediate: true })

await garantirBase()

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
