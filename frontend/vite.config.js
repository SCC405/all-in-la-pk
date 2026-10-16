import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend es un proyecto independiente del backend (RNF-01).
// Se comunica con la API REST mediante la URL definida en VITE_API_URL.
export default defineConfig(({ mode }) => {
  // Solo para desarrollo: con VITE_API_PROXY apuntando a una API remota, las
  // peticiones salen del navegador como mismo origen y Vite las reenvia desde el
  // servidor. Asi se puede trabajar contra la API desplegada sin tocar su CORS,
  // que solo admite el origen de Render. En produccion no interviene.
  const destinoApi = loadEnv(mode, process.cwd(), '').VITE_API_PROXY;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      ...(destinoApi && {
        proxy: {
          '/api': { target: destinoApi, changeOrigin: true, secure: true },
        },
      }),
    },
  };
});
