import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import openapi from '../docs/openapi.js';

const docsRouter = Router();

// La especificación cruda, por si alguien quiere importarla en Postman o Insomnia.
docsRouter.get('/api-docs.json', (_request, response) => {
  response.status(200).json(openapi);
});

// Se ejecuta en el navegador, dentro de Swagger UI. Sin esto, el botón
// "Try it out" dejaría de funcionar en POST, PUT y DELETE al activar la
// protección CSRF, y HU-06 pide expresamente que las operaciones se puedan
// probar desde Swagger.
//
// swagger-ui-express serializa las funciones al generar la página, así que
// esta no puede usar nada de fuera de su propio cuerpo.
async function anadirTokenCsrf(peticion) {
  const metodo = (peticion.method || 'GET').toUpperCase();

  if (['GET', 'HEAD', 'OPTIONS'].includes(metodo)) return peticion;

  const leerCookie = () =>
    document.cookie
      .split('; ')
      .find((trozo) => trozo.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

  let token = leerCookie();

  if (!token) {
    await fetch('/api/csrf-token', { credentials: 'same-origin' });
    token = leerCookie();
  }

  if (token) {
    peticion.headers['X-CSRF-Token'] = decodeURIComponent(token);
  }

  return peticion;
}

docsRouter.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    customSiteTitle: 'All In La PK — API',
    swaggerOptions: {
      defaultModelsExpandDepth: 0,
      requestInterceptor: anadirTokenCsrf,
    },
  }),
);

export default docsRouter;
