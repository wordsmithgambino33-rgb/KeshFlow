
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // Allows cleaner imports like import X from '@/components/X'
    },
  },
  server: {
    port: 5173,
    open: true, // auto-opens in the browser
  },
  build: {
    outDir: 'dist',
  },
})
