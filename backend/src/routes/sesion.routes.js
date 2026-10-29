import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import {
  crearCerrarSesion,
  crearEstadoSesion,
  crearIniciarSesion,
} from '../middlewares/sesion.js';

const sesionRouter = Router();

// Se cuentan solo los fallos. El sexto intento desde la misma IP durante una
// ventana de 15 minutos recibe 429; un acceso correcto no consume el cupo.
const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(request, response) {
    console.warn('Límite de intentos de acceso desde', request.ip ?? 'origen desconocido');
    response.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' });
  },
});

sesionRouter.get('/sesion', crearEstadoSesion(env));
sesionRouter.post('/sesion', limitarLogin, crearIniciarSesion(env));
sesionRouter.delete('/sesion', crearCerrarSesion(env));

export default sesionRouter;
