import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../src/app.js';
import { generarToken, tokenEsValido } from '../src/middlewares/csrf.js';
import { cabecerasCsrf, obtenerCsrf } from './ayuda-csrf.js';

const SECRETO = 'secreto-de-prueba';

async function servidorDePrueba(contexto) {
  const servidor = await new Promise((resolve, reject) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
    s.on('error', reject);
  });

  contexto.after(() => new Promise((resolve) => servidor.close(resolve)));

  return `http://127.0.0.1:${servidor.address().port}`;
}

// ---------- el token en sí ----------

test('cada token generado es distinto', () => {
  assert.notEqual(generarToken(SECRETO), generarToken(SECRETO));
});

test('un token recién generado se valida contra su propio secreto', () => {
  assert.equal(tokenEsValido(generarToken(SECRETO), SECRETO), true);
});

test('un token firmado con otro secreto se rechaza', () => {
  // Es lo que impide que alguien capaz de escribir cookies fabrique tokens.
  assert.equal(tokenEsValido(generarToken('otro-secreto'), SECRETO), false);
});

test('se rechaza un token manipulado aunque conserve la forma', () => {
  const [valor, firma] = generarToken(SECRETO).split('.');

  assert.equal(tokenEsValido(`${valor}modificado.${firma}`, SECRETO), false);
  assert.equal(tokenEsValido(`${valor}.${firma.replace(/.$/, '0')}`, SECRETO), false);
});

test('se rechaza cualquier cosa que no tenga la forma valor.firma', () => {
  for (const basura of ['', 'sin-punto', 'a.b.c', null, undefined, 42, {}]) {
    assert.equal(tokenEsValido(basura, SECRETO), false, `debería rechazar ${JSON.stringify(basura)}`);
  }
});

// ---------- la API ----------

test('GET /api/csrf-token entrega un token y lo deja en la cookie', async (context) => {
  const origen = await servidorDePrueba(context);

  const respuesta = await fetch(`${origen}/api/csrf-token`);
  const cuerpo = await respuesta.json();
  const cookie = respuesta.headers.getSetCookie().find((c) => c.startsWith('XSRF-TOKEN='));

  assert.equal(respuesta.status, 200);
  assert.ok(cuerpo.csrfToken);
  assert.ok(cookie, 'debería venir la cookie XSRF-TOKEN');
  assert.ok(cookie.includes(cuerpo.csrfToken), 'la cookie y el cuerpo deben llevar el mismo token');

  // No es HttpOnly a propósito: el frontend tiene que poder leerla para
  // reenviarla en la cabecera. Por eso el token va firmado.
  assert.equal(cookie.toLowerCase().includes('httponly'), false);
});

test('las lecturas no necesitan token', async (context) => {
  const origen = await servidorDePrueba(context);

  // Se usan rutas que no consultan la base de datos: lo que se comprueba aquí
  // es que el middleware deja pasar los métodos seguros, no el contenido.
  assert.equal((await fetch(`${origen}/api/health`)).status, 200);
  assert.equal((await fetch(`${origen}/api-docs.json`)).status, 200);
});

test('un POST sin token se rechaza con 403 y explica cómo obtenerlo', async (context) => {
  const origen = await servidorDePrueba(context);

  const respuesta = await fetch(`${origen}/api/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Intruso' }),
  });

  assert.equal(respuesta.status, 403);
  assert.match((await respuesta.json()).error, /GET \/api\/csrf-token/);
});

test('un POST con la cabecera pero sin la cookie se rechaza', async (context) => {
  const origen = await servidorDePrueba(context);
  const csrf = await obtenerCsrf(origen);

  const respuesta = await fetch(`${origen}/api/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.token },
    body: JSON.stringify({ nombre: 'Intruso' }),
  });

  assert.equal(respuesta.status, 403);
});

test('un POST cuya cabecera no coincide con la cookie se rechaza', async (context) => {
  const origen = await servidorDePrueba(context);
  const unaSesion = await obtenerCsrf(origen);
  const otraSesion = await obtenerCsrf(origen);

  const respuesta = await fetch(`${origen}/api/categorias`, {
    method: 'POST',
    headers: cabecerasCsrf({ token: otraSesion.token, cookie: unaSesion.cookie }),
    body: JSON.stringify({ nombre: 'Intruso' }),
  });

  assert.equal(respuesta.status, 403);
  assert.equal((await respuesta.json()).error, 'Token CSRF inválido');
});

test('un POST desde otro origen se rechaza aunque lleve un token válido', async (context) => {
  const origen = await servidorDePrueba(context);
  const csrf = await obtenerCsrf(origen);

  // Esto es el ataque: una página en otro dominio que envía la petición.
  const respuesta = await fetch(`${origen}/api/categorias`, {
    method: 'POST',
    headers: cabecerasCsrf(csrf, { Origin: 'https://sitio-malicioso.example' }),
    body: JSON.stringify({ nombre: 'Intruso' }),
  });

  assert.equal(respuesta.status, 403);
  assert.equal((await respuesta.json()).error, 'Origen no permitido para esta operación');
});

test('el propio origen del servidor se acepta, para que Swagger pueda probar la API', async (context) => {
  const origen = await servidorDePrueba(context);
  const csrf = await obtenerCsrf(origen);

  // Swagger UI se sirve desde la API, así que sus peticiones llevan este Origin
  // y no el del frontend. Antes daban 403 y rompían el "Try it out" de HU-06.
  const respuesta = await fetch(`${origen}/api/categorias`, {
    method: 'POST',
    headers: cabecerasCsrf(csrf, { Origin: origen }),
    body: JSON.stringify({}),
  });

  assert.notEqual(respuesta.status, 403, 'el origen propio no debería rechazarse');
});

test('DELETE y PUT también están protegidos', async (context) => {
  const origen = await servidorDePrueba(context);

  for (const method of ['PUT', 'DELETE']) {
    const respuesta = await fetch(`${origen}/api/categorias/000000000000000000000000`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'PUT' ? JSON.stringify({ nombre: 'x' }) : undefined,
    });

    assert.equal(respuesta.status, 403, `${method} debería exigir token`);
  }
});
