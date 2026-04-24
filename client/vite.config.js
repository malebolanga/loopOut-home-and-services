import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'animations';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('@heroicons')) return 'icons-hero';
            return 'vendor';
          }
        }
      }
    }
  }
})
