import assert from 'node:assert/strict';
import test from 'node:test';
import { alCaducarSesion, api } from '../src/services/apiCliente.js';

test('un 401 protegido cierra la sesión, pero credenciales incorrectas no', async () => {
  const fetchOriginal = globalThis.fetch;
  let avisos = 0;
  const dejarDeEscuchar = alCaducarSesion(() => { avisos += 1; });

  globalThis.fetch = async (url) => {
    if (url.endsWith('/csrf-token')) {
      return Response.json({ csrfToken: 'token-de-prueba' });
    }

    if (url.endsWith('/sesion')) {
      return Response.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    if (url.endsWith('/categorias')) {
      return Response.json({ error: 'Necesitas iniciar sesión' }, { status: 401 });
    }

    throw new Error(`Petición inesperada: ${url}`);
  };

  try {
    await assert.rejects(api.post('/sesion', { usuario: 'admin', password: 'incorrecta' }),
      (error) => error.estado === 401);
    assert.equal(avisos, 0);

    await assert.rejects(api.post('/categorias', { nombre: 'Fichas' }),
      (error) => error.estado === 401);
    assert.equal(avisos, 1);
  } finally {
    dejarDeEscuchar();
    globalThis.fetch = fetchOriginal;
  }
});
