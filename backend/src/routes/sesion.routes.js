import { Router } from 'express';
import { env } from '../config/env.js';
import {
  crearCerrarSesion,
  crearEstadoSesion,
  crearIniciarSesion,
} from '../middlewares/sesion.js';

const sesionRouter = Router();

sesionRouter.get('/sesion', crearEstadoSesion(env));
sesionRouter.post('/sesion', crearIniciarSesion(env));
sesionRouter.delete('/sesion', crearCerrarSesion(env));

export default sesionRouter;
