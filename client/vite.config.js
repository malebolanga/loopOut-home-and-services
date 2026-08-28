import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {},
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[Vite Proxy Error]', err.message);
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Backend server is starting or unavailable' }));
            }
          });
        },
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
            const normalizedId = id.replace(/\\/g, '/');
            if (
              normalizedId.includes('/react/') ||
              normalizedId.includes('/react-dom/') ||
              normalizedId.includes('/scheduler/') ||
              normalizedId.includes('/react-router/') ||
              normalizedId.includes('/react-router-dom/') ||
              normalizedId.includes('/@remix-run/') ||
              normalizedId.includes('/react-redux/') ||
              normalizedId.includes('/@reduxjs/') ||
              normalizedId.includes('/redux/') ||
              normalizedId.includes('/redux-persist/') ||
              normalizedId.includes('/react-helmet-async/') ||
              normalizedId.includes('/@headlessui/') ||
              normalizedId.includes('/prop-types/')
            ) {
              return 'vendor-react';
            }
            if (
              normalizedId.includes('swiper') ||
              normalizedId.includes('framer-motion') ||
              normalizedId.includes('leaflet')
            ) {
              return 'vendor-visuals';
            }
            if (normalizedId.includes('firebase') || normalizedId.includes('@firebase')) {
              return 'vendor-firebase';
            }
            if (
              normalizedId.includes('@heroicons') ||
              normalizedId.includes('lucide-react') ||
              normalizedId.includes('react-icons')
            ) {
              return 'vendor-icons';
            }
            return 'vendor-core';
          }
        }
      }
    }
  }
})
