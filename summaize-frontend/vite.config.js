import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'bootstrap-icons': 'bootstrap-icons/font/bootstrap-icons.css',
    },
  },
  server: {
    host: true, // Fügt localhost hinzu
    port: 5173, // Frontend Port
    open: true, // Öffnet Browser automatisch
    strictPort: true, // Wirft Fehler wenn Port belegt ist
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Backend Port
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    fs: {
      // Erlaubt Vite, Dateien außerhalb des Projekt-Roots zu laden
      allow: ['..'],
      strict: true,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Fügt Sourcemaps für Debugging hinzu
    minify: 'terser', // Bessere Minimierung
    terserOptions: {
      compress: {
        drop_console: false, // Behält console.logs im Production Build
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  optimizeDeps: {
    include: ['bootstrap', 'jquery'],
  },
})
