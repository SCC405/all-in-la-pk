import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function parsePort(value) {
  const port = Number.parseInt(value ?? '4000', 10);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT debe ser un número entero entre 1 y 65535.');
  }

  return port;
}

function esVerdadero(valor) {
  return ['1', 'true', 'si', 'sí'].includes(valor?.trim().toLowerCase() ?? '');
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: parsePort(process.env.PORT),
  mongodbUri: process.env.MONGODB_URI?.trim() || '',
  corsOrigin: process.env.CORS_ORIGIN?.trim() || 'http://localhost:5173',

  // Certificados para servir HTTPS directamente. En local se generan con
  // `npm run certificados`; en producción normalmente no hacen falta, porque
  // el proveedor de despliegue termina TLS antes de llegar a Express.
  httpsKeyPath: process.env.HTTPS_KEY_PATH?.trim() || '',
  httpsCertPath: process.env.HTTPS_CERT_PATH?.trim() || '',

  // Solo se activa detrás de un proxy de verdad. Si se activara siempre,
  // cualquier cliente podría enviar X-Forwarded-Proto: https y saltarse
  // la redirección.
  trustProxy: esVerdadero(process.env.TRUST_PROXY),
  forzarHttps: esVerdadero(process.env.FORZAR_HTTPS),

  // Firma los tokens CSRF. Sin un secreto fijo el servidor arranca igual, pero
  // cada reinicio invalida los tokens ya emitidos: tolerable en desarrollo,
  // no en produccion, donde ademas puede haber varias instancias.
  csrfSecret: process.env.CSRF_SECRET?.trim() || '',
});
