import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'firebase/storage': fileURLToPath(new URL('./src/services/secureStorageCompat.js', import.meta.url)),
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        secure: false,
      },
    },
  },
    plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('swiper') || id.includes('framer-motion') || id.includes('leaflet')) {
              return 'vendor-visuals';
            }
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'vendor-firebase';
            }
            return 'vendor-core';
          }
        }
      }
    }
  }
})
