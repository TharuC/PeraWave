import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk — cached separately from app code
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
