import { Router } from 'express';
import { env } from '../config/env.js';

const healthRouter = Router();

healthRouter.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'all-in-la-pk-backend',
    environment: env.nodeEnv,
  });
});

export default healthRouter;
