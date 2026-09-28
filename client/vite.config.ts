import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development, /api calls are proxied to the Express server (no CORS setup needed locally)
    proxy: { '/api': 'http://localhost:5001' },
  },
});
