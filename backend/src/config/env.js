import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function parsePort(value) {
  const port = Number.parseInt(value ?? '4000', 10);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT debe ser un número entero entre 1 y 65535.');
  }

  return port;
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: parsePort(process.env.PORT),
  mongodbUri: process.env.MONGODB_URI?.trim() || '',
  corsOrigin: process.env.CORS_ORIGIN?.trim() || 'http://localhost:5173',
});
