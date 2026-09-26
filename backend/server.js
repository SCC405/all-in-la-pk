import app from './src/app.js';
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';

let httpServer;
let isShuttingDown = false;

async function startServer() {
  try {
    await connectDatabase(env.mongodbUri);

    httpServer = app.listen(env.port, () => {
      console.log(`Backend disponible en http://localhost:${env.port}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`No fue posible iniciar el backend: ${message}`);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Cerrando el backend por señal ${signal}...`);

  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }

  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
