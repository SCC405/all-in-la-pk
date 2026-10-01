import assert from 'node:assert/strict';
import test from 'node:test';
import {
  aumentarCantidad,
  CANTIDAD_MINIMA,
  carritoReducer,
  contarUnidades,
  disminuirCantidad,
  eliminarProducto,
} from '../src/utils/carrito.js';

const FICHAS = { _id: 'f1', nombre: 'Fichas de póker', stock: 3 };
const TAPETE = { _id: 't1', nombre: 'Tapete verde', stock: 10 };

function carritoCon(...pares) {
  return {
    items: pares.map(([producto, cantidad]) => ({ producto, cantidad })),
    mensaje: '',
  };
}

const cantidadDe = (estado, id) =>
  estado.items.find((item) => item.producto._id === id)?.cantidad;

// ---------- aumentar ----------

test('aumentar sube la cantidad en uno', () => {
  const resultado = aumentarCantidad(carritoCon([FICHAS, 1]), 'f1');

  assert.equal(cantidadDe(resultado, 'f1'), 2);
});

test('aumentar no supera el stock disponible', () => {
  const estado = carritoCon([FICHAS, 3]); // stock = 3
  const resultado = aumentarCantidad(estado, 'f1');

  assert.equal(cantidadDe(resultado, 'f1'), 3, 'la cantidad no debería cambiar');
  assert.match(resultado.mensaje, /No hay más unidades/);
});

test('aumentar solo afecta al producto indicado', () => {
  const resultado = aumentarCantidad(carritoCon([FICHAS, 1], [TAPETE, 2]), 'f1');

  assert.equal(cantidadDe(resultado, 'f1'), 2);
  assert.equal(cantidadDe(resultado, 't1'), 2);
});

// ---------- disminuir ----------

test('disminuir baja la cantidad en uno', () => {
  const resultado = disminuirCantidad(carritoCon([FICHAS, 3]), 'f1');

  assert.equal(cantidadDe(resultado, 'f1'), 2);
});

test('disminuir se detiene en la cantidad mínima y no elimina el producto', () => {
  const estado = carritoCon([FICHAS, CANTIDAD_MINIMA]);
  const resultado = disminuirCantidad(estado, 'f1');

  assert.equal(cantidadDe(resultado, 'f1'), CANTIDAD_MINIMA);
  assert.equal(resultado.items.length, 1, 'el producto debe seguir en el carrito');
  assert.match(resultado.mensaje, /cantidad mínima/);
});

test('la cantidad nunca llega a cero por mucho que se insista', () => {
  let estado = carritoCon([FICHAS, 2]);

  for (let intento = 0; intento < 5; intento += 1) {
    estado = disminuirCantidad(estado, 'f1');
  }

  assert.equal(cantidadDe(estado, 'f1'), CANTIDAD_MINIMA);
});

// ---------- eliminar ----------

test('eliminar quita el producto del carrito', () => {
  const resultado = eliminarProducto(carritoCon([FICHAS, 2], [TAPETE, 1]), 'f1');

  assert.equal(resultado.items.length, 1);
  assert.equal(resultado.items[0].producto._id, 't1');
  assert.match(resultado.mensaje, /se quitó del carrito/);
});

test('eliminar el último producto deja el carrito vacío', () => {
  const resultado = eliminarProducto(carritoCon([FICHAS, 2]), 'f1');

  assert.deepEqual(resultado.items, []);
});

// ---------- productos que no están ----------

test('actuar sobre un producto que no está en el carrito no cambia nada', () => {
  const estado = carritoCon([FICHAS, 1]);

  for (const operacion of [aumentarCantidad, disminuirCantidad, eliminarProducto]) {
    assert.deepEqual(operacion(estado, 'no-existe'), estado, operacion.name);
  }
});

// ---------- a través del reducer ----------

test('el reducer entiende las tres acciones nuevas', () => {
  let estado = carritoCon([FICHAS, 1]);

  estado = carritoReducer(estado, { type: 'cantidad/aumentada', productoId: 'f1' });
  assert.equal(cantidadDe(estado, 'f1'), 2);

  estado = carritoReducer(estado, { type: 'cantidad/disminuida', productoId: 'f1' });
  assert.equal(cantidadDe(estado, 'f1'), 1);

  estado = carritoReducer(estado, { type: 'producto/eliminado', productoId: 'f1' });
  assert.deepEqual(estado.items, []);
});

test('el total de unidades sigue cuadrando tras los cambios', () => {
  let estado = carritoCon([FICHAS, 1], [TAPETE, 1]);

  estado = aumentarCantidad(estado, 't1');
  estado = aumentarCantidad(estado, 't1');
  assert.equal(contarUnidades(estado.items), 4);

  estado = eliminarProducto(estado, 'f1');
  assert.equal(contarUnidades(estado.items), 3);
});
