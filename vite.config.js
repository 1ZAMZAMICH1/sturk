// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Отключаем минификацию - возможно она ломает seed
    minify: false,
    // Отключаем разделение чанков
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  // Фиксируем версию Three.js
  resolve: {
    dedupe: ['three', '@react-three/fiber', '@react-three/drei']
  }
})