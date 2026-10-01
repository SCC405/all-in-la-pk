import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const NOMBRE_COOKIE = 'XSRF-TOKEN';
export const NOMBRE_CABECERA = 'x-csrf-token';

const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Si no hay secreto configurado se usa uno aleatorio por proceso: el mecanismo
// sigue funcionando en desarrollo, pero los tokens mueren con el servidor.
const secretoDeRespaldo = randomBytes(32).toString('hex');

function firmar(valor, secreto) {
  return createHmac('sha256', secreto || secretoDeRespaldo)
    .update(valor)
    .digest('hex');
}

function sonIguales(a, b) {
  const bufferA = Buffer.from(String(a));
  const bufferB = Buffer.from(String(b));

  // timingSafeEqual exige la misma longitud y, sobre todo, compara en tiempo
  // constante: una comparación normal filtra cuántos caracteres acertó quien
  // lo intenta a ciegas.
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/** Genera un token con la forma `valor.firma`. */
export function generarToken(secreto) {
  const valor = randomBytes(32).toString('hex');
  return `${valor}.${firmar(valor, secreto)}`;
}

/** Comprueba que el token no haya sido inventado por quien lo envía. */
export function tokenEsValido(token, secreto) {
  if (typeof token !== 'string') return false;

  const partes = token.split('.');
  if (partes.length !== 2) return false;

  const [valor, firma] = partes;
  if (!valor || !firma) return false;

  return sonIguales(firma, firmar(valor, secreto));
}

function opcionesCookie({ forzarHttps }) {
  return {
    // Legible por JavaScript a propósito: el frontend tiene que leerla para
    // reenviarla en la cabecera. Eso es el patrón de doble envío, y por eso
    // el token va firmado: que se lea no basta para falsificarlo.
    httpOnly: false,
    sameSite: forzarHttps ? 'none' : 'lax',
    secure: forzarHttps,
    path: '/',
  };
}

/** Emite un token nuevo, lo deja en la cookie y lo devuelve en el cuerpo. */
export function crearEmisorDeToken(env) {
  return function emitirToken(_request, response) {
    const token = generarToken(env.csrfSecret);

    response.cookie(NOMBRE_COOKIE, token, opcionesCookie(env));
    response.status(200).json({ csrfToken: token });
  };
}

function origenPermitido(request, env) {
  const origen = request.get('origin');

  // Los clientes que no son navegadores (curl, Postman, las pruebas) no envían
  // Origin. Un ataque CSRF sí lo lleva siempre, porque lo pone el navegador y
  // no se puede falsear desde JavaScript.
  if (!origen) return true;

  // El propio servidor también es un origen legítimo: Swagger UI se sirve desde
  // aquí, y sus peticiones de "Try it out" salen con este Origin, no con el del
  // frontend. Sin esta línea, probar la API desde su documentación daba 403.
  const propio = `${request.protocol}://${request.get('host')}`;

  return origen === env.corsOrigin || origen === propio;
}

/**
 * Protege las operaciones que modifican datos.
 *
 * Dos comprobaciones independientes: que el origen sea el esperado, y que el
 * token de la cabecera coincida con el de la cookie y esté bien firmado.
 */
export function crearProteccionCsrf(env) {
  return function proteccionCsrf(request, response, next) {
    if (METODOS_SEGUROS.has(request.method)) {
      next();
      return;
    }

    if (!origenPermitido(request, env)) {
      response.status(403).json({ error: 'Origen no permitido para esta operación' });
      return;
    }

    const deLaCookie = request.cookies?.[NOMBRE_COOKIE];
    const deLaCabecera = request.get(NOMBRE_CABECERA);

    if (!deLaCookie || !deLaCabecera) {
      response.status(403).json({
        error:
          'Falta el token CSRF. Solicita uno en GET /api/csrf-token y envíalo en la cabecera X-CSRF-Token.',
      });
      return;
    }

    if (!sonIguales(deLaCookie, deLaCabecera) || !tokenEsValido(deLaCabecera, env.csrfSecret)) {
      response.status(403).json({ error: 'Token CSRF inválido' });
      return;
    }

    next();
  };
}
