import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { nivelesDeProxy } from '../src/config/env.js';

test('TRUST_PROXY admite un número de saltos o un sí/no', () => {
  assert.equal(nivelesDeProxy('3'), 3);
  assert.equal(nivelesDeProxy(' 2 '), 2);
  assert.equal(nivelesDeProxy('true'), 1);
  assert.equal(nivelesDeProxy('1'), 1);
  assert.equal(nivelesDeProxy('0'), false);
  assert.equal(nivelesDeProxy('false'), false);
  assert.equal(nivelesDeProxy(''), false);
  assert.equal(nivelesDeProxy(undefined), false);
});

// Reproduce lo que llega a Render: el cliente puede mandar su propio
// X-Forwarded-For y cada proxy añade una entrada al final.
test('con los saltos correctos se ve la IP real aunque el cliente la falsifique', async (context) => {
  const app = express();
  app.get('/ip', (request, response) => response.json({ ip: request.ip }));

  const servidor = await new Promise((resolve) => {
    const instancia = app.listen(0, '127.0.0.1', () => resolve(instancia));
  });
  context.after(() => new Promise((resolve) => servidor.close(resolve)));

  // 1.2.3.4 la inventa el cliente; 181.56.110.189 la añade el primer proxy y
  // 10.31.179.45 el segundo, que es quien conecta (aquí, 127.0.0.1).
  const ipVista = async (saltos) => {
    app.set('trust proxy', nivelesDeProxy(saltos));
    const respuesta = await fetch(`http://127.0.0.1:${servidor.address().port}/ip`, {
      headers: { 'X-Forwarded-For': '1.2.3.4, 181.56.110.189, 10.31.179.45' },
    });
    return (await respuesta.json()).ip;
  };

  assert.equal(await ipVista('1'), '10.31.179.45', 'un salto de menos: la IP del proxy');
  assert.equal(await ipVista('2'), '181.56.110.189', 'los saltos justos: la IP real');
  assert.equal(await ipVista('3'), '1.2.3.4', 'un salto de más: la IP que inventa el cliente');
});
