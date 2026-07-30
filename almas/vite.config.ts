import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fonts/*.woff2', 'icone.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
        // As capas do Grimório vêm de CDNs externas: guarda o que já foi visto
        // para que a estante continue com rosto quando o app abrir offline.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(cdn\.myanimelist\.net|books\.google\.com|media\.rawg\.io)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'capas-grimorio',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 120 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'ALMAS',
        short_name: 'ALMAS',
        description: 'RPG da vida real. Carrega a memória por você, devolve recompensa na hora.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0d0b0a',
        theme_color: '#0d0b0a',
        categories: ['productivity', 'lifestyle'],
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
