import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    // Firebase SDK is large but unavoidable; suppress the warning
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React runtime — tiny, loads first
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          // Split Firebase into sub-packages so the browser can parse
          // firestore, auth, and analytics in parallel
          if (id.includes('node_modules/firebase/firestore') || id.includes('@firebase/firestore')) {
            return 'firebase-firestore';
          }
          if (id.includes('node_modules/firebase/auth') || id.includes('@firebase/auth')) {
            return 'firebase-auth';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase-core';
          }
          // Manager panel — customers never download this code
          if (
            id.includes('/views/manager/') ||
            id.includes('firebase-admin')
          ) {
            return 'manager';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['food_b.png', 'favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Kwa Gavo',
        short_name: 'Kwa Gavo',
        description: 'Kwa Gavo – Authentic street flavors, burgers, fries, and vibes.',
        theme_color: '#120707',
        background_color: '#181214',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache all JS, CSS, HTML, icons AND local food images
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,jpg,jpeg}'],
        runtimeCaching: [
          // Local kwagavo images: serve from cache, refresh in background
          {
            urlPattern: /\/kwagavo\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kwagavo-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/(firestore|identitytoolkit|securetoken|www)\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.firebaseapp\.com\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})

