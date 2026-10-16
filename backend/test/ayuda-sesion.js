// IMPORTANTE: este módulo se importa **antes** que `../src/app.js` en las
// pruebas de integración, y el orden no es casual. `config/env.js` lee
// process.env al cargarse y congela el resultado, así que las credenciales
// tienen que estar puestas antes de que eso ocurra. Si se importa después, el
// servidor arranca sin administrador y toda mutación responde 401.
import { generarHash } from '../src/utils/password.js';

export const USUARIO_DE_PRUEBAS = 'admin-de-pruebas';
export const PASSWORD_DE_PRUEBAS = 'contrasena-de-pruebas';

// `||=` para no pisar lo que ya haya definido quien ejecuta las pruebas.
process.env.ADMIN_USUARIO ||= USUARIO_DE_PRUEBAS;
process.env.ADMIN_PASSWORD_HASH ||= generarHash(PASSWORD_DE_PRUEBAS);
process.env.SESION_SECRET ||= 'secreto-de-sesion-para-pruebas';

/**
 * Inicia sesión contra el servidor de pruebas y devuelve la cookie.
 *
 * Necesita el par CSRF porque `POST /api/sesion` también está protegido: un
 * formulario de inicio de sesión es tan falsificable como cualquier otro.
 */
export async function abrirSesion(origen, csrf) {
  const respuesta = await fetch(`${origen}/api/sesion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf.token,
      Cookie: csrf.cookie,
    },
    body: JSON.stringify({
      usuario: process.env.ADMIN_USUARIO,
      password: PASSWORD_DE_PRUEBAS,
    }),
  });

  if (respuesta.status !== 200) {
    throw new Error(
      `No se pudo abrir la sesión de pruebas (${respuesta.status}). ` +
        'Revisa que ayuda-sesion.js se importe antes que src/app.js.',
    );
  }

  const cookie = respuesta.headers
    .getSetCookie()
    .find((valor) => valor.startsWith('sesion='))
    ?.split(';')[0];

  return cookie;
}
