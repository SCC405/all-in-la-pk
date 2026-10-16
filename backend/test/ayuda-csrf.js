// Node no guarda cookies entre peticiones, así que en las pruebas hay que
// pedir el token y reenviar la cookie a mano. En el navegador esto lo hace
// el propio navegador.

/** Pide un token al servidor y devuelve el par cookie + token. */
export async function obtenerCsrf(origen) {
  const respuesta = await fetch(`${origen}/api/csrf-token`);
  const { csrfToken } = await respuesta.json();

  const cookie = respuesta.headers
    .getSetCookie()
    .find((valor) => valor.startsWith('XSRF-TOKEN='))
    ?.split(';')[0];

  return { token: csrfToken, cookie };
}

/**
 * Cabeceras para una operación que modifica datos.
 *
 * Si `csrf.cookieSesion` está puesta se envía junto a la del token: desde
 * HU-28 toda mutación necesita además sesión de administrador, y el navegador
 * mandaría las dos cookies en la misma cabecera.
 */
export function cabecerasCsrf(csrf, extra = {}) {
  const cookies = [csrf.cookie, csrf.cookieSesion].filter(Boolean).join('; ');

  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrf.token,
    Cookie: cookies,
    ...extra,
  };
}
