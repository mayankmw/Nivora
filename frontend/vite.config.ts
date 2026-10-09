import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Resolves the "@/..." alias declared in tsconfig.app.json.
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    // Same-origin API calls in development: the browser talks to :5173 and
    // Vite forwards /api to the NestJS backend.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
