import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Ithe 'react-map-gl' kadhun taka ani fakt 'mapbox-gl' theva
    include: ['mapbox-gl'] 
  },
  build: {
    commonjsOptions: {
      include: [/react-map-gl/, /node_modules/]
    }
  }
})