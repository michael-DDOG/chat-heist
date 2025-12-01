import { defineConfig } from 'vite';

export default defineConfig({
  root: './web',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    rollupOptions: {
      input: './web/index.html',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/game': 'http://localhost:3000',
      '/leaderboard': 'http://localhost:3000',
      '/shop': 'http://localhost:3000',
      '/dailies': 'http://localhost:3000',
      '/me': 'http://localhost:3000',
    },
  },
});
