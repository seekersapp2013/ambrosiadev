import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: [
      'livekit-server-sdk',
      'aws-sdk',
      'mock-aws-s3',
      'nock',
      '@mapbox/node-pre-gyp',
      'bcrypt'
    ],
    include: ['livekit-client'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    rollupOptions: {
      external: [
        'aws-sdk',
        'mock-aws-s3', 
        'nock',
        'livekit-server-sdk',
        '@mapbox/node-pre-gyp',
        'bcrypt',
        'path',
        'crypto'
      ]
    }
  },
  server: {
    host: true,
    allowedHosts: ['app.ambrosia.africa', 'dev.ambrosia.africa', 'localhost'],
    proxy: {
      // Forward all /api requests directly to the real backend
      '/api': {
        target: 'http://oathstone-api2.azurewebsites.net',
        changeOrigin: true,
        // No rewrite needed, backend expects /api endpoints as is
        // If your backend paths are like /createWallet, remove this comment and uncomment next line
        // rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
});
