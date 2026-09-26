import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../src/app.js';

async function startTestServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

test('GET /api/health informa que el backend está disponible', async (context) => {
  const server = await startTestServer();
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'all-in-la-pk-backend');
});

test('una ruta inexistente responde con un error 404 controlado', async (context) => {
  const server = await startTestServer();
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/no-existe`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'Ruta no encontrada');
});
