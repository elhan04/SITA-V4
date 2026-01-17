
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Penting agar file bisa dibaca di hosting statis (Netlify/Vercel)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
