import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,  // 允许局域网访问
    strictPort: true,
  },
})
