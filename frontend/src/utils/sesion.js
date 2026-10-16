// Lógica de la sesión, aparte del componente para poder probarla sin render.

export const FASES = Object.freeze({
  COMPROBANDO: 'comprobando',
  ACTIVA: 'activa',
  INACTIVA: 'inactiva',
});

export const ESTADO_INICIAL_SESION = Object.freeze({
  fase: FASES.COMPROBANDO,
  usuario: null,
});

/**
 * Traduce la respuesta de `GET /api/sesion` al estado de la aplicación.
 *
 * Si la consulta falla —backend caído, sin red— se asume que no hay sesión.
 * Es lo prudente: ante la duda, no enseñar el panel.
 */
export function sesionDesdeRespuesta(respuesta) {
  // `=== true` y no solo truthy: cualquier otra cosa que llegue en ese campo
  // —una cadena, un número— es una respuesta que no entendemos, y entenderla
  // mal aquí significa enseñar el panel a quien no debe.
  if (respuesta?.activa === true) {
    return { fase: FASES.ACTIVA, usuario: respuesta.usuario ?? null };
  }

  return { fase: FASES.INACTIVA, usuario: null };
}

/** Mensajes de validación del formulario, con la forma `{ campo: mensaje }`. */
export function validarCredenciales(formulario = {}) {
  const errores = {};

  if (typeof formulario.usuario !== 'string' || formulario.usuario.trim() === '') {
    errores.usuario = 'El usuario es obligatorio.';
  }

  // Sin longitud mínima a propósito: la contraseña correcta es la que es, y
  // exigir aquí un mínimo solo estorbaría a quien ya la tiene bien.
  if (typeof formulario.password !== 'string' || formulario.password === '') {
    errores.password = 'La contraseña es obligatoria.';
  }

  return errores;
}

export function hayErroresDeCredenciales(errores = {}) {
  return Object.keys(errores).length > 0;
}

/**
 * Convierte el fallo al entrar en el mensaje que se muestra.
 *
 * El `401` del backend ya trae un texto que no revela si el usuario existe; se
 * respeta tal cual. Un error de red necesita otra explicación, porque decir
 * «credenciales incorrectas» cuando el servidor no respondió sería mentir.
 */
export function mensajeDeFallo(error) {
  if (error?.estado === 401) {
    return error.message || 'Credenciales incorrectas.';
  }

  if (error?.estado === 0) {
    return 'No se pudo conectar con el servidor de All In La PK.';
  }

  return error?.message || 'No se pudo iniciar sesión.';
}

/**
 * Decide a dónde volver tras iniciar sesión.
 *
 * Solo se aceptan rutas internas: si alguien llega con
 * `/login?destino=https://otro-sitio` no debemos mandarle ahí al entrar.
 */
export function destinoSeguro(destino, porDefecto = '/admin') {
  if (typeof destino !== 'string' || destino === '') return porDefecto;

  // Una barra sola al principio y nada más: descarta `//otro-sitio` y
  // `https://otro-sitio`, que el navegador trataría como externos.
  if (!destino.startsWith('/') || destino.startsWith('//')) return porDefecto;

  return destino;
}
