// Un año, que es lo que recomienda OWASP para HSTS.
const HSTS_MAX_AGE = 31_536_000;

// La comprobación de salud se exime de la redirección. El proveedor de
// despliegue puede consultarla por dentro, sin pasar por el proxy que añade
// X-Forwarded-Proto, y entonces recibiría un 308 en vez de un 200 y daría el
// servicio por caído.
const RUTAS_EXENTAS = new Set(['/api/health']);

function esSeguro(request) {
  // `request.secure` ya tiene en cuenta X-Forwarded-Proto cuando Express confía
  // en el proxy. Si no confía, solo es true si la conexión es TLS de verdad.
  return request.secure;
}

/**
 * Redirige a HTTPS y anuncia HSTS.
 *
 * Solo actúa cuando `forzarHttps` está activo, de modo que en desarrollo se
 * puede seguir usando http://localhost sin estorbos.
 */
export function crearForzarHttps({ forzarHttps }) {
  return function forzarHttpsMiddleware(request, response, next) {
    if (!forzarHttps || RUTAS_EXENTAS.has(request.path)) {
      next();
      return;
    }

    if (!esSeguro(request)) {
      // 308 conserva el método y el cuerpo: un POST redirigido sigue siendo POST.
      response.redirect(308, `https://${request.headers.host}${request.originalUrl}`);
      return;
    }

    // HSTS solo tiene sentido sobre una conexión ya segura; sobre http lo
    // ignoran los navegadores, y anunciarlo ahí solo genera confusión.
    response.setHeader('Strict-Transport-Security', `max-age=${HSTS_MAX_AGE}; includeSubDomains`);
    next();
  };
}

export { HSTS_MAX_AGE };
