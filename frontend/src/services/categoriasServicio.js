import { api } from './apiCliente.js';

// Endpoints de categorías expuestos por el backend (HU-03).
export const categoriasServicio = {
  listar: () => api.get('/categorias'),
  crear: (categoria) => api.post('/categorias', categoria),
  actualizar: (id, categoria) => api.put(`/categorias/${id}`, categoria),
  eliminar: (id) => api.delete(`/categorias/${id}`),
};
