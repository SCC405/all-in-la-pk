import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { crearForzarHttps } from './middlewares/forzar-https.js';
import { notFound } from './middlewares/not-found.js';
import categoriasRouter from './routes/categorias.routes.js';
import docsRouter from './routes/docs.routes.js';
import healthRouter from './routes/health.routes.js';
import productosRouter from './routes/productos.routes.js';

const app = express();

app.disable('x-powered-by');

// Detrás de un proxy (el proveedor de despliegue) Express necesita permiso
// explícito para leer X-Forwarded-Proto y saber si la petición original era
// HTTPS. Sin esta línea, la redirección de abajo entraría en bucle.
if (env.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(crearForzarHttps(env));
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));

// La documentación va antes que las rutas de datos para que /api-docs no
// caiga en el manejador de "ruta no encontrada".
app.use(docsRouter);

app.use('/api', healthRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/productos', productosRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
