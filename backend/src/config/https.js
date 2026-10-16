import { readFileSync } from 'node:fs';

/**
 * Devuelve las opciones TLS si hay certificados configurados, o `null` si no.
 *
 * No es obligatorio tenerlos: en producción el proveedor de despliegue termina
 * TLS antes de llegar a Express, así que el servidor solo necesita servir HTTP
 * detrás del proxy. Los certificados sirven para demostrar HTTPS en local.
 */
export function opcionesHttps({ httpsKeyPath, httpsCertPath }) {
  const hayClave = Boolean(httpsKeyPath);
  const hayCertificado = Boolean(httpsCertPath);

  if (!hayClave && !hayCertificado) return null;

  if (hayClave !== hayCertificado) {
    throw new Error(
      'HTTPS incompleto: hacen falta HTTPS_KEY_PATH y HTTPS_CERT_PATH, no solo uno de los dos.',
    );
  }

  try {
    return {
      key: readFileSync(httpsKeyPath),
      cert: readFileSync(httpsCertPath),
    };
  } catch (error) {
    throw new Error(
      `No se pudieron leer los certificados HTTPS. Genera unos de desarrollo con ` +
        `"npm run certificados" o revisa las rutas configuradas.`,
      { cause: error },
    );
  }
}
