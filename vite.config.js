import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['gymapp_icon.jpg'],
      manifest: {
        name: 'GymTrack KK',
        short_name: 'GymTrack',
        description: 'Track your workouts by day',
        theme_color: '#001529',
        background_color: '#141414',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'gymapp_icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'gymapp_icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'gymapp_icon.jpg',
            sizes: '180x180',
            type: 'image/jpeg',
            purpose: 'apple touch icon'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,jpg,png,svg}']
      }
    })
  ],
})