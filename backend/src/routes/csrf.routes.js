import { Router } from 'express';
import { env } from '../config/env.js';
import { crearEmisorDeToken } from '../middlewares/csrf.js';

const csrfRouter = Router();

csrfRouter.get('/csrf-token', crearEmisorDeToken(env));

export default csrfRouter;
