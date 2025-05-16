import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['softball-icon.svg', 'softball-bg.jpg'],
      manifest: {
        name: 'NCAA D1 Softball Stats & Rankings',
        short_name: 'D1 Softball',
        description: 'Get the latest NCAA Division 1 Softball rankings, statistics, and tournament information',
        theme_color: '#6bb2ff',
        icons: [
          {
            src: '/softball-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: '/softball-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/softball-icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
