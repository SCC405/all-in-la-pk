import assert from 'node:assert/strict';
import test from 'node:test';
import { uriDePruebas } from './ayuda-base-de-datos.js';

function conUri(valor, ejecutar) {
  const anterior = process.env.MONGODB_URI_TEST;

  if (valor === undefined) delete process.env.MONGODB_URI_TEST;
  else process.env.MONGODB_URI_TEST = valor;

  try {
    return ejecutar();
  } finally {
    if (anterior === undefined) delete process.env.MONGODB_URI_TEST;
    else process.env.MONGODB_URI_TEST = anterior;
  }
}

test('sin MONGODB_URI_TEST devuelve null para que las pruebas se salten', () => {
  assert.equal(conUri(undefined, uriDePruebas), null);
  assert.equal(conUri('   ', uriDePruebas), null);
});

test('acepta una base terminada en _test', () => {
  const uri = 'mongodb://localhost:27017/all_in_la_pk_test';

  assert.equal(conUri(uri, uriDePruebas), uri);
});

test('acepta una base terminada en -test y una URI de Atlas con parámetros', () => {
  const uri = 'mongodb+srv://usuario:clave@cluster.mongodb.net/all-in-la-pk-test?retryWrites=true';

  assert.equal(conUri(uri, uriDePruebas), uri);
});

test('rechaza la base real del proyecto', () => {
  assert.throws(
    () => conUri('mongodb+srv://usuario:clave@cluster.mongodb.net/all_in_la_pk', uriDePruebas),
    /no parece una base de pruebas/,
  );
});

test('rechaza la base de un proyecto anterior en el mismo clúster', () => {
  assert.throws(
    () => conUri('mongodb+srv://usuario:clave@cluster.mongodb.net/proyecto_anterior?retryWrites=true', uriDePruebas),
    /no parece una base de pruebas/,
  );
});

test('rechaza una URI sin nombre de base de datos', () => {
  assert.throws(
    () => conUri('mongodb://localhost:27017', uriDePruebas),
    /no indica una base de datos/,
  );
});
