import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { crearProteccionCsrf } from './middlewares/csrf.js';
import { crearRequiereSesion } from './middlewares/sesion.js';
import { crearForzarHttps } from './middlewares/forzar-https.js';
import { notFound } from './middlewares/not-found.js';
import categoriasRouter from './routes/categorias.routes.js';
import csrfRouter from './routes/csrf.routes.js';
import docsRouter from './routes/docs.routes.js';
import healthRouter from './routes/health.routes.js';
import productosRouter from './routes/productos.routes.js';
import sesionRouter from './routes/sesion.routes.js';

const app = express();

app.disable('x-powered-by');

// Detrás de un proxy (el proveedor de despliegue) Express necesita permiso
// explícito para leer X-Forwarded-Proto y saber si la petición original era
// HTTPS. Sin esta línea, la redirección de abajo entraría en bucle.
if (env.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(crearForzarHttps(env));

// credentials: true es imprescindible para que el navegador acepte la cookie
// del token CSRF cuando el frontend vive en otro origen.
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// La documentación va antes que las rutas de datos para que /api-docs no
// caiga en el manejador de "ruta no encontrada".
app.use(docsRouter);

app.use('/api', healthRouter);
app.use('/api', csrfRouter);

// A partir de aqui, toda operacion que modifique datos necesita token CSRF.
app.use(crearProteccionCsrf(env));

// Iniciar sesion va despues del CSRF (tambien hay que protegerlo) pero antes
// de exigir sesion: si no, no habria forma de abrir la primera.
app.use('/api', sesionRouter);

// Y a partir de aqui, ademas, sesion de administrador. El middleware deja
// pasar GET y HEAD, de modo que el catalogo sigue siendo publico.
const requiereSesion = crearRequiereSesion(env);

app.use('/api/categorias', requiereSesion, categoriasRouter);
app.use('/api/productos', requiereSesion, productosRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
