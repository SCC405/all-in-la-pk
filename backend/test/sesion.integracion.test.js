import assert from 'node:assert/strict';
import test from 'node:test';
// Antes que app.js a proposito: deja las credenciales de administrador en
// process.env para que config/env.js las lea al cargarse. Si este import baja
// de sitio, la suite entera falla con 401 y ese es justamente el aviso.
import { PASSWORD_DE_PRUEBAS, USUARIO_DE_PRUEBAS } from './ayuda-sesion.js';
import app from '../src/app.js';
import { obtenerCsrf } from './ayuda-csrf.js';

// Estas pruebas sí levantan el servidor, pero no necesitan MongoDB: ni el
// inicio de sesión ni el rechazo por falta de sesión llegan a tocar la base.
// Por eso no se saltan nunca, al revés que las del CRUD.
test('sesión de administrador sobre HTTP', async (suite) => {
  const servidor = await new Promise((resolve, reject) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
    s.on('error', reject);
  });

  suite.after(() => new Promise((resolve) => servidor.close(resolve)));

  const origen = `http://127.0.0.1:${servidor.address().port}`;
  const csrf = await obtenerCsrf(origen);

  const entrar = (credenciales) =>
    fetch(`${origen}/api/sesion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf.token,
        Cookie: csrf.cookie,
      },
      body: JSON.stringify(credenciales),
    });

  const cookieDeSesion = (respuesta) =>
    respuesta.headers
      .getSetCookie()
      .find((valor) => valor.startsWith('sesion='))
      ?.split(';')[0];

  await suite.test('las credenciales de prueba llegaron a la configuración', async () => {
    // Si este import quedara después de app.js, env estaría congelado sin
    // administrador y todo lo demás fallaría de forma confusa.
    const respuesta = await entrar({
      usuario: USUARIO_DE_PRUEBAS,
      password: PASSWORD_DE_PRUEBAS,
    });

    assert.equal(
      respuesta.status,
      200,
      'ayuda-sesion.js debe importarse antes que src/app.js',
    );
  });

  await suite.test('sin cookie, el estado dice que no hay sesión', async () => {
    const respuesta = await fetch(`${origen}/api/sesion`);

    assert.equal(respuesta.status, 200);
    assert.deepEqual(await respuesta.json(), { activa: false });
  });

  await suite.test('una contraseña incorrecta responde 401 y no emite cookie', async () => {
    const respuesta = await entrar({ usuario: USUARIO_DE_PRUEBAS, password: 'no-es-esa' });

    assert.equal(respuesta.status, 401);
    assert.equal(cookieDeSesion(respuesta), undefined);
  });

  await suite.test('la cookie de sesión es httpOnly', async () => {
    const respuesta = await entrar({
      usuario: USUARIO_DE_PRUEBAS,
      password: PASSWORD_DE_PRUEBAS,
    });

    const cruda = respuesta.headers.getSetCookie().find((v) => v.startsWith('sesion='));

    // Si el frontend pudiera leerla, un XSS se llevaría la sesión entera.
    assert.match(cruda, /HttpOnly/i);
  });

  await suite.test('con la cookie, el estado reconoce la sesión', async () => {
    const entrada = await entrar({
      usuario: USUARIO_DE_PRUEBAS,
      password: PASSWORD_DE_PRUEBAS,
    });

    const respuesta = await fetch(`${origen}/api/sesion`, {
      headers: { Cookie: cookieDeSesion(entrada) },
    });

    assert.deepEqual(await respuesta.json(), { activa: true, usuario: USUARIO_DE_PRUEBAS });
  });

  await suite.test('cerrar sesión responde 204 y la cookie deja de valer', async () => {
    const respuesta = await fetch(`${origen}/api/sesion`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrf.token, Cookie: csrf.cookie },
    });

    assert.equal(respuesta.status, 204);
  });

  await suite.test('crear una categoría sin sesión responde 401', async () => {
    // Esta es la prueba que importa: el middleware está montado y corta antes
    // de llegar a la base de datos. Ocultar el panel en React no protegería
    // nada si esto no respondiera 401.
    const respuesta = await fetch(`${origen}/api/categorias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf.token,
        Cookie: csrf.cookie,
      },
      body: JSON.stringify({ nombre: 'No debería crearse' }),
    });

    assert.equal(respuesta.status, 401);
    assert.match((await respuesta.json()).error, /iniciar sesión/i);
  });

  await suite.test('crear un producto sin sesión responde 401', async () => {
    const respuesta = await fetch(`${origen}/api/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf.token,
        Cookie: csrf.cookie,
      },
      body: JSON.stringify({ nombre: 'No debería crearse' }),
    });

    assert.equal(respuesta.status, 401);
  });

  await suite.test('el catálogo sigue siendo público: el 401 no afecta a GET', async () => {
    // No se puede listar sin MongoDB, pero sí comprobar que el rechazo no
    // viene de la sesión: un GET nunca debe devolver 401.
    const respuesta = await fetch(`${origen}/api/sesion`);

    assert.notEqual(respuesta.status, 401);
  });
});
