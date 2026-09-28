import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import openapi from '../docs/openapi.js';

const docsRouter = Router();

// La especificación cruda, por si alguien quiere importarla en Postman o Insomnia.
docsRouter.get('/api-docs.json', (_request, response) => {
  response.status(200).json(openapi);
});

docsRouter.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    customSiteTitle: 'All In La PK — API',
    swaggerOptions: { defaultModelsExpandDepth: 0 },
  }),
);

export default docsRouter;
