import assert from 'node:assert/strict';
import test from 'node:test';
import {
  agregarProductoAlCarrito,
  carritoReducer,
  contarUnidades,
  ESTADO_INICIAL_CARRITO,
} from '../src/utils/carrito.js';

const baraja = { _id: 'producto-1', nombre: 'Baraja profesional', stock: 3, precio: 45000 };
const fichas = { _id: 'producto-2', nombre: 'Set de fichas', stock: 5, precio: 120000 };

test('agrega un producto nuevo con cantidad inicial de uno', () => {
  const estado = agregarProductoAlCarrito(ESTADO_INICIAL_CARRITO, baraja);

  assert.equal(estado.items.length, 1);
  assert.deepEqual(estado.items[0], { producto: baraja, cantidad: 1 });
  assert.match(estado.mensaje, /Baraja profesional/);
});

test('conserva productos diferentes dentro del mismo carrito', () => {
  const conBaraja = carritoReducer(ESTADO_INICIAL_CARRITO, {
    type: 'producto/agregado',
    producto: baraja,
  });
  const conDosProductos = carritoReducer(conBaraja, {
    type: 'producto/agregado',
    producto: fichas,
  });

  assert.deepEqual(conDosProductos.items.map((item) => item.producto._id), [
    'producto-1',
    'producto-2',
  ]);
  assert.equal(contarUnidades(conDosProductos.items), 2);
});

test('agregar otra vez el mismo producto incrementa sus unidades sin duplicar la línea', () => {
  const primeraAdicion = agregarProductoAlCarrito(ESTADO_INICIAL_CARRITO, baraja);
  const segundaAdicion = agregarProductoAlCarrito(primeraAdicion, baraja);

  assert.equal(segundaAdicion.items.length, 1);
  assert.equal(segundaAdicion.items[0].cantidad, 2);
  assert.equal(contarUnidades(segundaAdicion.items), 2);
});

test('impide agregar productos agotados o superar el stock disponible', () => {
  const agotado = { _id: 'producto-3', nombre: 'Mesa agotada', stock: 0 };
  const intentoAgotado = agregarProductoAlCarrito(ESTADO_INICIAL_CARRITO, agotado);

  assert.deepEqual(intentoAgotado.items, []);

  const unaUnidad = { ...baraja, stock: 1 };
  const primeraAdicion = agregarProductoAlCarrito(ESTADO_INICIAL_CARRITO, unaUnidad);
  const intentoExcedido = agregarProductoAlCarrito(primeraAdicion, unaUnidad);

  assert.equal(intentoExcedido.items[0].cantidad, 1);
  assert.match(intentoExcedido.mensaje, /No hay más unidades/);
});
