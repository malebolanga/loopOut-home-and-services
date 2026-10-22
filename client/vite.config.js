import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

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
      '/uploads': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
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
        // Keep React and its renderer together. Other large, independent
        // libraries can be cached separately and are only fetched when a
        // screen that needs them is opened.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          const normalized = id.replace(/\\/g, '/');
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store|react-redux|@reduxjs)[\\/]/.test(id)) return 'react-core';
          if (normalized.includes('/firebase/')) return 'firebase';
          if (normalized.includes('/swiper/')) return 'swiper';
          if (normalized.includes('/framer-motion/')) return 'motion';
          if (normalized.includes('/react-icons/') || normalized.includes('/lucide-react/')) return 'icons';
          if (normalized.includes('/jspdf/') || normalized.includes('/jspdf-autotable/')) return 'pdf';
          if (normalized.includes('/leaflet/') || normalized.includes('/@react-google-maps/')) return 'maps';
        }
      }
    },
  }
})
