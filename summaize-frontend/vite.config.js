import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173, // Explizit den Port setzen
    open: true, // Öffnet automatisch den Browser beim Start
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Entfernen Sie die rewrite-Zeile
      },
    },
  },
  build: {
    outDir: 'dist', // Setzt das Ausgabeverzeichnis für den Build
    assetsDir: 'assets', // Setzt das Verzeichnis für Assets im Build
  },
  css: {
    devSourcemap: true, // Aktiviert Sourcemaps für CSS im Entwicklungsmodus
  },
})
