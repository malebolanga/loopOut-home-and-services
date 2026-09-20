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
    },
  },
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
    // Do not manually split packages that import React. The previous split
    // could allow cached vendor chunks to run with a different React runtime,
    // producing createContext/useLayoutEffect errors in production.
  }
})
