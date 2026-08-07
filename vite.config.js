import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    headers: {
      'Cache-Control': 'no-store',
    },
    hmr: {
      host: '0.0.0.0',
      protocol: 'ws',
      port: 3000,
    },
  },
});
