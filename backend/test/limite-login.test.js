import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../src/app.js';
import { obtenerCsrf } from './ayuda-csrf.js';

test('el sexto intento fallido de login recibe 429 sin emitir sesión', async (context) => {
  const servidor = await new Promise((resolve, reject) => {
    const instancia = app.listen(0, '127.0.0.1', () => resolve(instancia));
    instancia.on('error', reject);
  });
  context.after(() => new Promise((resolve) => servidor.close(resolve)));

  const origen = `http://127.0.0.1:${servidor.address().port}`;
  const csrf = await obtenerCsrf(origen);

  for (let intento = 1; intento <= 6; intento += 1) {
    const respuesta = await fetch(`${origen}/api/sesion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf.token,
        Cookie: csrf.cookie,
      },
      body: JSON.stringify({ usuario: 'no-existe', password: 'incorrecta' }),
    });

    assert.equal(respuesta.status, intento === 6 ? 429 : 401, `intento ${intento}`);
    assert.equal(respuesta.headers.getSetCookie().some((cookie) => cookie.startsWith('sesion=')), false);
  }

  // El límite solo protege el login: la lectura pública sigue disponible.
  const salud = await fetch(`${origen}/api/health`);
  assert.equal(salud.status, 200);
});
