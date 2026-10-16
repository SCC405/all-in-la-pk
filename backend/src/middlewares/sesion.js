import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { verificarPassword } from '../utils/password.js';

export const NOMBRE_COOKIE = 'sesion';

// Ocho horas: una jornada. Pasado ese plazo el token deja de valer aunque la
// cookie siga en el navegador, porque la caducidad va dentro de la firma.
export const DURACION_MS = 8 * 60 * 60 * 1000;

// Leer el catálogo es público: la tienda no pide sesión a nadie. Solo se
// protege lo que modifica datos.
const METODOS_PUBLICOS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Mismo criterio que en la protección CSRF: sin secreto configurado se usa uno
// por proceso, de modo que en desarrollo funciona, pero cada reinicio invalida
// las sesiones abiertas.
const secretoDeRespaldo = randomBytes(32).toString('hex');

function firmar(valor, secreto) {
  return createHmac('sha256', secreto || secretoDeRespaldo)
    .update(valor)
    .digest('hex');
}

function sonIguales(a, b) {
  const bufferA = Buffer.from(String(a));
  const bufferB = Buffer.from(String(b));

  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/**
 * Genera un token con la forma `usuario.caducidad.firma`.
 *
 * El usuario va en base64url para que su contenido no pueda introducir puntos
 * y descolocar el despiece.
 */
export function generarToken(usuario, secreto, ahora = Date.now()) {
  const cuerpo = `${Buffer.from(String(usuario), 'utf8').toString('base64url')}.${ahora + DURACION_MS}`;

  return `${cuerpo}.${firmar(cuerpo, secreto)}`;
}

/** Devuelve `{ usuario, caduca }` si el token es legítimo y está vigente, o `null`. */
export function leerToken(token, secreto, ahora = Date.now()) {
  if (typeof token !== 'string') return null;

  const partes = token.split('.');
  if (partes.length !== 3) return null;

  const [usuarioCodificado, caducaTexto, firma] = partes;
  if (!usuarioCodificado || !caducaTexto || !firma) return null;

  // Primero la firma: si el token está manipulado no merece la pena ni mirar
  // la fecha, que también va firmada y por eso no se puede estirar.
  if (!sonIguales(firma, firmar(`${usuarioCodificado}.${caducaTexto}`, secreto))) return null;

  const caduca = Number.parseInt(caducaTexto, 10);
  if (!Number.isInteger(caduca) || caduca <= ahora) return null;

  return { usuario: Buffer.from(usuarioCodificado, 'base64url').toString('utf8'), caduca };
}

function opcionesCookie({ forzarHttps }) {
  return {
    // Al revés que la cookie del CSRF: a esta el frontend no tiene que acceder
    // nunca, así que se oculta a JavaScript. Si alguien consigue inyectar un
    // script en la página, no puede leerse la sesión.
    httpOnly: true,
    sameSite: forzarHttps ? 'none' : 'lax',
    secure: forzarHttps,
    path: '/',
  };
}

/** `POST /api/sesion` — comprueba las credenciales y abre la sesión. */
export function crearIniciarSesion(env) {
  return function iniciarSesion(request, response) {
    const { usuario, password } = request.body ?? {};

    // Sin credenciales configuradas no entra nadie. Falla cerrado a propósito:
    // una instalación a medio configurar no debe quedar abierta.
    if (!env.adminUsuario || !env.adminPasswordHash) {
      response.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    const usuarioCorrecto = sonIguales(usuario, env.adminUsuario);
    const passwordCorrecta = verificarPassword(password, env.adminPasswordHash);

    // El mismo mensaje en los dos casos: decir «ese usuario no existe» le
    // confirma a quien lo intenta cuál de las dos mitades ya acertó.
    if (!usuarioCorrecto || !passwordCorrecta) {
      response.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    response.cookie(NOMBRE_COOKIE, generarToken(env.adminUsuario, env.sesionSecret), {
      ...opcionesCookie(env),
      maxAge: DURACION_MS,
    });
    response.status(200).json({ usuario: env.adminUsuario });
  };
}

/** `DELETE /api/sesion` — cierra la sesión. */
export function crearCerrarSesion(env) {
  return function cerrarSesion(_request, response) {
    response.clearCookie(NOMBRE_COOKIE, opcionesCookie(env));
    response.status(204).end();
  };
}

/** `GET /api/sesion` — dice si hay sesión, para que el frontend lo sepa al arrancar. */
export function crearEstadoSesion(env) {
  return function estadoSesion(request, response) {
    const sesion = leerToken(request.cookies?.[NOMBRE_COOKIE], env.sesionSecret);

    if (!sesion) {
      response.status(200).json({ activa: false });
      return;
    }

    response.status(200).json({ activa: true, usuario: sesion.usuario });
  };
}

/**
 * Exige sesión para modificar datos.
 *
 * Esta es la protección de verdad. Ocultar el panel en el frontend solo evita
 * enseñar una puerta que no se puede abrir; sin esto, cualquiera crearía
 * productos con `curl`.
 */
export function crearRequiereSesion(env) {
  return function requiereSesion(request, response, next) {
    if (METODOS_PUBLICOS.has(request.method)) {
      next();
      return;
    }

    const sesion = leerToken(request.cookies?.[NOMBRE_COOKIE], env.sesionSecret);

    if (!sesion) {
      response.status(401).json({
        error: 'Necesitas iniciar sesión para esta operación. Entra en POST /api/sesion.',
      });
      return;
    }

    request.sesion = sesion;
    next();
  };
}
