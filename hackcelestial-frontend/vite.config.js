import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Recoup — Travel Disruption Recovery',
        short_name: 'Recoup',
        description: 'AI-powered travel booking with real-time disruption recovery.',
        theme_color: '#A9791F',
        background_color: '#F7F5F0',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell only — the itinerary/booking API is dynamic and
        // shouldn't be served stale from a cache.
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
})
