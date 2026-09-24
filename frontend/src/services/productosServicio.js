import { api } from './apiCliente.js';

// Endpoints de productos expuestos por el backend (HU-05).
export const productosServicio = {
  listar: () => api.get('/productos'),
  obtener: (id) => api.get(`/productos/${id}`),
  crear: (producto) => api.post('/productos', producto),
  actualizar: (id, producto) => api.put(`/productos/${id}`, producto),
  eliminar: (id) => api.delete(`/productos/${id}`),
};
