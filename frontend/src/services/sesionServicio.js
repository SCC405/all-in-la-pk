import { api } from './apiCliente.js';

// Endpoints de sesión de administrador expuestos por el backend (HU-28).
//
// La cookie de sesión es `httpOnly`, así que aquí no se lee ni se guarda nada:
// viaja sola gracias al `credentials: 'include'` del cliente. Lo único que
// sabe el frontend es lo que le responde `consultar()`.
export const sesionServicio = {
  consultar: () => api.get('/sesion'),
  entrar: (credenciales) => api.post('/sesion', credenciales),
  salir: () => api.delete('/sesion'),
};
