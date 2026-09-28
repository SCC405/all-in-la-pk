import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Producto, {
  DESCRIPCION_PRODUCTO_MAX_LENGTH,
  IMAGEN_MAX_LENGTH,
  NOMBRE_PRODUCTO_MAX_LENGTH,
} from '../src/models/producto.model.js';

const categoria = new mongoose.Types.ObjectId();

function productoValido(cambios = {}) {
  return new Producto({
    nombre: 'Set de 500 fichas',
    descripcion: 'Maletín completo para torneos.',
    precio: 249900,
    stock: 8,
    imagen: 'https://ejemplo.com/set-500.webp',
    categoria,
    ...cambios,
  });
}

test('un producto válido no produce errores de validación', () => {
  assert.equal(productoValido().validateSync(), undefined);
});

test('cada producto recibe un identificador único', () => {
  const primero = productoValido();
  const segundo = productoValido();

  assert.ok(primero._id instanceof mongoose.Types.ObjectId);
  assert.notEqual(primero._id.toString(), segundo._id.toString());
});

test('nombre, precio, stock, imagen y categoría son obligatorios', () => {
  const error = new Producto().validateSync();

  assert.ok(error);
  assert.deepEqual(
    Object.keys(error.errors).sort(),
    ['categoria', 'imagen', 'nombre', 'precio', 'stock'],
  );
});

test('el precio no puede ser negativo ni infinito', () => {
  const negativo = productoValido({ precio: -1 }).validateSync();
  const infinito = productoValido({ precio: Infinity }).validateSync();

  assert.equal(negativo.errors.precio.message, 'El precio no puede ser negativo.');
  assert.equal(infinito.errors.precio.message, 'El precio debe ser un número finito.');
});

test('el stock debe ser un entero no negativo', () => {
  const negativo = productoValido({ stock: -1 }).validateSync();
  const decimal = productoValido({ stock: 1.5 }).validateSync();

  assert.equal(negativo.errors.stock.message, 'El stock no puede ser negativo.');
  assert.equal(decimal.errors.stock.message, 'El stock debe ser un número entero.');
});

test('cero es válido para precio y stock', () => {
  assert.equal(productoValido({ precio: 0, stock: 0 }).validateSync(), undefined);
});

test('los textos se normalizan quitando espacios sobrantes', () => {
  const producto = productoValido({
    nombre: '  Baraja profesional  ',
    descripcion: '  Cartas con acabado plástico.  ',
    imagen: '  https://ejemplo.com/baraja.webp  ',
  });

  assert.equal(producto.nombre, 'Baraja profesional');
  assert.equal(producto.descripcion, 'Cartas con acabado plástico.');
  assert.equal(producto.imagen, 'https://ejemplo.com/baraja.webp');
});

test('la descripción es opcional y queda como texto vacío', () => {
  const producto = productoValido({ descripcion: undefined });

  assert.equal(producto.validateSync(), undefined);
  assert.equal(producto.descripcion, '');
});

test('los textos respetan sus longitudes máximas', () => {
  const error = productoValido({
    nombre: 'P'.repeat(NOMBRE_PRODUCTO_MAX_LENGTH + 1),
    descripcion: 'P'.repeat(DESCRIPCION_PRODUCTO_MAX_LENGTH + 1),
    imagen: 'P'.repeat(IMAGEN_MAX_LENGTH + 1),
  }).validateSync();

  assert.ok(error.errors.nombre);
  assert.ok(error.errors.descripcion);
  assert.ok(error.errors.imagen);
});

test('la categoría referencia al modelo Categoria', () => {
  assert.equal(Producto.schema.path('categoria').options.ref, 'Categoria');
  assert.equal(Producto.schema.path('categoria').options.required[0], true);
});

test('el modelo registra las marcas de tiempo', () => {
  assert.ok(Producto.schema.path('createdAt'));
  assert.ok(Producto.schema.path('updatedAt'));
});
