
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // cleaner imports like import X from '@/components/X'
    },
  },
  server: {
    port: 5173,
    open: true,         // auto-open in browser
    strictPort: true,   // fail if port already in use
    watch: {
      usePolling: true, // helpful on Linux/WSL or network file systems
      interval: 100,    // check for changes every 100ms
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // pre-bundle essential deps
  },
  build: {
    outDir: 'dist',
  },
});
