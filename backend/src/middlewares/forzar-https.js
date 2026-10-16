// Un año, que es lo que recomienda OWASP para HSTS.
const HSTS_MAX_AGE = 31_536_000;

// La comprobación de salud se exime de la redirección. El proveedor de
// despliegue puede consultarla por dentro, sin pasar por el proxy que añade
// X-Forwarded-Proto, y entonces recibiría un 308.
//
// Render da por sana cualquier respuesta 2xx o 3xx, así que el 308 no marcaría
// el servicio como caído. El problema es otro: con un 308 la comprobación
// pasaría sin haber tocado la aplicación, verificando que el redirector
// funciona en vez de que la API responde.
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
    if (!forzarHttps) {
      next();
      return;
    }

    const seguro = esSeguro(request);

    // La exención se salta la redirección, no la cabecera. Antes salía del
    // middleware de una vez y /api/health acababa siendo la única ruta de la
    // API que respondía sin HSTS, incluso sobre HTTPS.
    if (!seguro && !RUTAS_EXENTAS.has(request.path)) {
      // 308 conserva el método y el cuerpo: un POST redirigido sigue siendo POST.
      response.redirect(308, `https://${request.headers.host}${request.originalUrl}`);
      return;
    }

    // HSTS solo tiene sentido sobre una conexión ya segura; sobre http lo
    // ignoran los navegadores, y anunciarlo ahí solo genera confusión.
    if (seguro) {
      response.setHeader('Strict-Transport-Security', `max-age=${HSTS_MAX_AGE}; includeSubDomains`);
    }

    next();
  };
}

export { HSTS_MAX_AGE };
