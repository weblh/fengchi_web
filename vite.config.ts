import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/nodeApi': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nodeApi/, '')
      }
    }
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    base: './',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})