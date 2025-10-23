
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // clean imports
    },
  },
  server: {
    port: 5173,
    open: true,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  optimizeDeps: {
    // ✅ Include only modular imports — NOT "firebase"
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'firebase/analytics',
      'react-toastify',
    ],
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
});
