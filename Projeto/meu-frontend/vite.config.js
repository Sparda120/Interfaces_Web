import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5096', // <--- Mudei para http e porta 5096
        changeOrigin: true,
        secure: false,
      }
    }
  }
})