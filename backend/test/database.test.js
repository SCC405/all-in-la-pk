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
