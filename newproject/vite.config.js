import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Разрешаем Vite читать файлы из соседней папки doc-bridge
      allow: ['..'] 
    }
  },
  resolve: {
    alias: {
      // Создаем удобный синоним @docbridge для путей
      '@docbridge': resolve(__dirname, '../doc-bridge/client/src')
    }
  }
})