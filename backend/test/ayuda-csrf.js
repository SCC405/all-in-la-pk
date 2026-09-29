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

/** Cabeceras para una operación que modifica datos. */
export function cabecerasCsrf(csrf, extra = {}) {
  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrf.token,
    Cookie: csrf.cookie,
    ...extra,
  };
}
