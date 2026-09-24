import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend es un proyecto independiente del backend (RNF-01).
// Se comunica con la API REST mediante la URL definida en VITE_API_URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
