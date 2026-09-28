import assert from 'node:assert/strict';
import test from 'node:test';
import { filtrarProductosPorCategoria } from '../src/utils/filtrarProductos.js';

const productos = [
  { _id: 'p1', nombre: 'Baraja', categoria: { _id: 'cartas', nombre: 'Cartas' } },
  { _id: 'p2', nombre: 'Tapete', categoria: { _id: 'mesas', nombre: 'Mesas' } },
  { _id: 'p3', nombre: 'Otra baraja', categoria: 'cartas' },
  { _id: 'p4', nombre: 'Sin categoría', categoria: null },
];

test('sin categoría seleccionada devuelve todos los productos', () => {
  assert.deepEqual(filtrarProductosPorCategoria(productos, ''), productos);
});

test('filtra productos cuya categoría viene poblada por el backend', () => {
  assert.deepEqual(
    filtrarProductosPorCategoria(productos, 'mesas').map((producto) => producto._id),
    ['p2'],
  );
});

test('también admite una categoría representada directamente por su id', () => {
  assert.deepEqual(
    filtrarProductosPorCategoria(productos, 'cartas').map((producto) => producto._id),
    ['p1', 'p3'],
  );
});

test('una categoría sin productos devuelve una lista vacía', () => {
  assert.deepEqual(filtrarProductosPorCategoria(productos, 'fichas'), []);
});
