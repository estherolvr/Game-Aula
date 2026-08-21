import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Game-Aula/',
  server: {
    port: 3000
  },
  build: {
    assetsInlineLimit: 0
  }
});
