import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // For proper path handling
  build: {
    outDir: 'dist',
    sourcemap: false,  // Faster builds
  }
})