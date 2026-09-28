import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Categoria, { DESCRIPCION_MAX_LENGTH, NOMBRE_MAX_LENGTH } from '../src/models/categoria.model.js';

test('una categoría válida no produce errores de validación', () => {
  const categoria = new Categoria({
    nombre: 'Fichas de póker',
    descripcion: 'Fichas sueltas y por juegos completos.',
  });

  assert.equal(categoria.validateSync(), undefined);
  assert.equal(categoria.nombre, 'Fichas de póker');
  assert.equal(categoria.descripcion, 'Fichas sueltas y por juegos completos.');
});

test('cada categoría recibe un identificador único', () => {
  const primera = new Categoria({ nombre: 'Cartas y barajas' });
  const segunda = new Categoria({ nombre: 'Tapetes' });

  assert.ok(primera._id instanceof mongoose.Types.ObjectId);
  assert.notEqual(primera._id.toString(), segunda._id.toString());
});

test('el nombre es obligatorio', () => {
  const error = new Categoria({ descripcion: 'Sin nombre' }).validateSync();

  assert.ok(error);
  assert.equal(error.errors.nombre.message, 'El nombre de la categoría es obligatorio.');
});

test('un nombre con solo espacios se considera vacío', () => {
  const error = new Categoria({ nombre: '   ' }).validateSync();

  assert.ok(error, 'se esperaba un error de validación para un nombre en blanco');
  assert.equal(error.errors.nombre.message, 'El nombre de la categoría es obligatorio.');
});

test('el nombre y la descripción se normalizan quitando espacios sobrantes', () => {
  const categoria = new Categoria({
    nombre: '  Mesas de póker  ',
    descripcion: '  Mesas plegables y profesionales.  ',
  });

  assert.equal(categoria.nombre, 'Mesas de póker');
  assert.equal(categoria.descripcion, 'Mesas plegables y profesionales.');
});

test('la descripción es opcional y queda como texto vacío', () => {
  const categoria = new Categoria({ nombre: 'Maletines' });

  assert.equal(categoria.validateSync(), undefined);
  assert.equal(categoria.descripcion, '');
});

test('se rechaza un nombre más largo de lo permitido', () => {
  const error = new Categoria({ nombre: 'P'.repeat(NOMBRE_MAX_LENGTH + 1) }).validateSync();

  assert.ok(error);
  assert.match(error.errors.nombre.message, /no puede superar los 60 caracteres/);
});

test('se rechaza una descripción más larga de lo permitido', () => {
  const error = new Categoria({
    nombre: 'Porta fichas',
    descripcion: 'P'.repeat(DESCRIPCION_MAX_LENGTH + 1),
  }).validateSync();

  assert.ok(error);
  assert.match(error.errors.descripcion.message, /no puede superar los 300 caracteres/);
});

test('el nombre está declarado como único para evitar categorías duplicadas', () => {
  assert.equal(Categoria.schema.path('nombre').options.unique, true);
});

test('el modelo registra las marcas de tiempo de creación y actualización', () => {
  assert.ok(Categoria.schema.path('createdAt'));
  assert.ok(Categoria.schema.path('updatedAt'));
});
