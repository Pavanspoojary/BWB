import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5173 },
  preview: { port: 8000 },
  build: { target: 'es2022', outDir: 'dist' },
});
