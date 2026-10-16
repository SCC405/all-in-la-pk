import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Categoria from '../src/models/categoria.model.js';
import { errorHandler } from '../src/middlewares/error-handler.js';

// Doble de `response` que solo registra con qué se le llamó.
function crearResponse() {
  const registro = { estado: undefined, cuerpo: undefined };

  return {
    registro,
    status(codigo) {
      registro.estado = codigo;
      return this;
    },
    json(cuerpo) {
      registro.cuerpo = cuerpo;
      return this;
    },
  };
}

test('un error de validación se traduce a 400 con el detalle por campo', () => {
  const error = new Categoria({ descripcion: 'sin nombre' }).validateSync();
  const response = crearResponse();

  errorHandler(error, {}, response, () => {});

  assert.equal(response.registro.estado, 400);
  assert.equal(response.registro.cuerpo.error, 'Datos no válidos');
  assert.equal(
    response.registro.cuerpo.detalles.nombre,
    'El nombre de la categoría es obligatorio.',
  );
});

test('un identificador con forma inválida se traduce a 400', () => {
  const error = new mongoose.Error.CastError('ObjectId', 'no-es-un-id', '_id');
  const response = crearResponse();

  errorHandler(error, {}, response, () => {});

  assert.equal(response.registro.estado, 400);
  assert.equal(response.registro.cuerpo.error, 'El identificador recibido no es válido');
});

test('un duplicado de MongoDB se traduce a 409', () => {
  const error = Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
  const response = crearResponse();

  errorHandler(error, {}, response, () => {});

  assert.equal(response.registro.estado, 409);
  assert.equal(response.registro.cuerpo.error, 'Ya existe un registro con ese nombre');
});

test('cualquier otro error sigue devolviendo 500 sin exponer detalles internos', (context) => {
  context.mock.method(console, 'error', () => {});

  const error = new Error('fallo inesperado con datos sensibles');
  const response = crearResponse();

  errorHandler(error, {}, response, () => {});

  assert.equal(response.registro.estado, 500);
  assert.equal(response.registro.cuerpo.error, 'Error interno del servidor');
  assert.equal(JSON.stringify(response.registro.cuerpo).includes('sensibles'), false);
});
