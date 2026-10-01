import { createServer as crearServidorHttp } from 'node:http';
import { createServer as crearServidorHttps } from 'node:https';
import app from './src/app.js';
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';
import { opcionesHttps } from './src/config/https.js';

let httpServer;
let isShuttingDown = false;

let protocolo = 'http';

function escuchar() {
  return new Promise((resolve, reject) => {
    const tls = opcionesHttps(env);
    protocolo = tls ? 'https' : 'http';

    httpServer = tls ? crearServidorHttps(tls, app) : crearServidorHttp(app);
    httpServer.listen(env.port);

    const alFallar = (error) => reject(error);
    httpServer.once('error', alFallar);
    httpServer.once('listening', () => {
      httpServer.off('error', alFallar);
      resolve();
    });
  });
}

function detalleDeInicio(error) {
  if (error?.code === 'EADDRINUSE') {
    return `El puerto ${env.port} ya está en uso.`;
  }

  return error instanceof Error ? error.message : 'Error desconocido';
}

async function startServer() {
  try {
    await connectDatabase(env.mongodbUri);
    await escuchar();
    console.log(`Backend disponible en ${protocolo}://localhost:${env.port}`);
  } catch (error) {
    console.error(`No fue posible iniciar el backend: ${detalleDeInicio(error)}`);
    await disconnectDatabase();
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
    const cierre = new Promise((resolve) => httpServer.close(resolve));
    httpServer.closeAllConnections?.();
    await cierre;
  }

  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
