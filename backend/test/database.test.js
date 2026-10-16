import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';

test('la conexión falla con un mensaje controlado cuando falta MONGODB_URI', async () => {
  await assert.rejects(
    connectDatabase(''),
    /MONGODB_URI no está configurada/,
  );
});

test('la conexión usa la URI recibida y configura un tiempo de espera', async (context) => {
  const uri = 'mongodb://localhost:27017/all-in-la-pk-test';

  const connectMock = context.mock.method(mongoose, 'connect', async () => mongoose);

  const connection = await connectDatabase(uri);

  assert.equal(connection, mongoose.connection);
  assert.equal(connectMock.mock.callCount(), 1);
  assert.deepEqual(connectMock.mock.calls[0].arguments, [
    uri,
    { serverSelectionTimeoutMS: 10_000 },
  ]);
});

test('un fallo de MongoDB devuelve un mensaje controlado sin exponer la URI', async (context) => {
  const uri = 'mongodb://usuario:clave-secreta@localhost:27017/all-in-la-pk';
  const connectionError = new Error(`No se pudo acceder a ${uri}`);

  context.mock.method(mongoose, 'connect', async () => {
    throw connectionError;
  });

  await assert.rejects(connectDatabase(uri), (error) => {
    assert.match(error.message, /No fue posible conectar con MongoDB/);
    assert.doesNotMatch(error.message, /clave-secreta/);
    assert.equal(error.cause, connectionError);
    return true;
  });
});

test('un fallo de autenticación lo dice, sin repetir nada del error original', async (context) => {
  const uri = 'mongodb://usuario:clave-secreta@localhost:27017/all_in_la_pk';
  const fallo = Object.assign(new Error(`bad auth : authentication failed para ${uri}`), { code: 8000 });

  context.mock.method(mongoose, 'connect', async () => {
    throw fallo;
  });

  await assert.rejects(connectDatabase(uri), (error) => {
    assert.match(error.message, /rechazó las credenciales/);
    assert.doesNotMatch(error.message, /clave-secreta/);
    return true;
  });
});

test('un clúster inalcanzable apunta a la lista de IP permitidas', async (context) => {
  const fallo = Object.assign(new Error('could not connect to any servers'), {
    name: 'MongooseServerSelectionError',
  });

  context.mock.method(mongoose, 'connect', async () => {
    throw fallo;
  });

  await assert.rejects(connectDatabase('mongodb://host/all_in_la_pk'), (error) => {
    assert.match(error.message, /lista de IP permitidas|clúster no esté pausado/);
    return true;
  });
});
