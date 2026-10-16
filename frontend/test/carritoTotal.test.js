import assert from 'node:assert/strict';
import test from 'node:test';
import {
  aumentarCantidad,
  calcularSubtotal,
  calcularTotal,
  disminuirCantidad,
  eliminarProducto,
} from '../src/utils/carrito.js';

const BARAJA = { _id: 'b1', nombre: 'Baraja profesional', precio: 45000, stock: 5 };
const FICHAS = { _id: 'f1', nombre: 'Set de fichas', precio: 120000, stock: 4 };

function estadoCon(...items) {
  return {
    items: items.map(([producto, cantidad]) => ({ producto, cantidad })),
    mensaje: '',
  };
}

test('calcula el subtotal multiplicando precio por cantidad', () => {
  assert.equal(calcularSubtotal({ producto: BARAJA, cantidad: 3 }), 135000);
});

test('suma los subtotales de todos los productos', () => {
  const items = estadoCon([BARAJA, 2], [FICHAS, 3]).items;

  assert.equal(calcularTotal(items), 450000);
});

test('un carrito vacío tiene total cero', () => {
  assert.equal(calcularTotal([]), 0);
});

test('el total aumenta al incrementar una cantidad', () => {
  const inicial = estadoCon([BARAJA, 1], [FICHAS, 1]);
  const actualizado = aumentarCantidad(inicial, 'b1');

  assert.equal(calcularTotal(inicial.items), 165000);
  assert.equal(calcularTotal(actualizado.items), 210000);
});

test('el total disminuye al reducir una cantidad', () => {
  const inicial = estadoCon([BARAJA, 3], [FICHAS, 1]);
  const actualizado = disminuirCantidad(inicial, 'b1');

  assert.equal(calcularTotal(inicial.items), 255000);
  assert.equal(calcularTotal(actualizado.items), 210000);
});

test('el total deja de contar un producto eliminado', () => {
  const inicial = estadoCon([BARAJA, 2], [FICHAS, 2]);
  const actualizado = eliminarProducto(inicial, 'f1');

  assert.equal(calcularTotal(inicial.items), 330000);
  assert.equal(calcularTotal(actualizado.items), 90000);
});
