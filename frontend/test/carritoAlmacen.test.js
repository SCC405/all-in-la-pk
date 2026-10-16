import assert from 'node:assert/strict';
import test from 'node:test';
import { carritoReducer, sincronizarConCatalogo } from '../src/utils/carrito.js';
import {
  DURACION_CARRITO_MS,
  leerItemsGuardados,
  serializarItems,
} from '../src/utils/carritoAlmacen.js';

const BARAJA = { _id: 'p1', nombre: 'Baraja Copag', precio: 62000, stock: 7 };
const TAPETE = { _id: 'p2', nombre: 'Tapete verde', precio: 95000, stock: 4 };

const ITEMS = [
  { producto: BARAJA, cantidad: 2 },
  { producto: TAPETE, cantidad: 1 },
];

// ---------- ida y vuelta ----------

test('lo que se guarda se vuelve a leer igual', () => {
  assert.deepEqual(leerItemsGuardados(serializarItems(ITEMS)), ITEMS);
});

test('un carrito vacío se lee como vacío', () => {
  assert.deepEqual(leerItemsGuardados(serializarItems([])), []);
});

// ---------- caducidad ----------

test('un carrito de hace unas horas sigue valiendo', () => {
  const ahora = Date.now();
  const guardado = serializarItems(ITEMS, ahora - DURACION_CARRITO_MS + 60_000);

  assert.deepEqual(leerItemsGuardados(guardado, ahora), ITEMS);
});

test('un carrito caducado se descarta entero', () => {
  // Más vale vacío que con precios de hace días.
  const ahora = Date.now();
  const guardado = serializarItems(ITEMS, ahora - DURACION_CARRITO_MS - 1);

  assert.deepEqual(leerItemsGuardados(guardado, ahora), []);
});

// ---------- lo guardado puede estar roto ----------

test('nada guardado no es un error', () => {
  for (const crudo of [null, undefined, '', 0]) {
    assert.deepEqual(leerItemsGuardados(crudo), [], String(crudo));
  }
});

test('un JSON corrupto no rompe la tienda', () => {
  // Pasa de verdad: alguien toca la clave a mano, o la escritura quedó a medias.
  for (const crudo of ['{', 'no soy json', '[1,2,', '{"items":']) {
    assert.deepEqual(leerItemsGuardados(crudo), [], crudo);
  }
});

test('una versión distinta se descarta en vez de migrarse', () => {
  const guardado = JSON.stringify({ version: 99, guardadoEn: Date.now(), items: ITEMS });

  assert.deepEqual(leerItemsGuardados(guardado), []);
});

test('sin marca de tiempo no hay forma de saber si caducó, así que se descarta', () => {
  const guardado = JSON.stringify({ version: 1, items: ITEMS });

  assert.deepEqual(leerItemsGuardados(guardado), []);
});

test('los artículos con forma inesperada se caen, y los buenos se quedan', () => {
  const guardado = JSON.stringify({
    version: 1,
    guardadoEn: Date.now(),
    items: [
      { producto: BARAJA, cantidad: 2 },
      null,
      { producto: { _id: 'x' }, cantidad: 1 },
      { producto: BARAJA, cantidad: 0 },
      { producto: BARAJA, cantidad: 1.5 },
      { producto: { ...TAPETE, precio: 'gratis' }, cantidad: 1 },
      { cantidad: 3 },
    ],
  });

  assert.deepEqual(leerItemsGuardados(guardado), [{ producto: BARAJA, cantidad: 2 }]);
});

// ---------- sincronización con el catálogo ----------

test('un precio que cambió en el panel se refresca en el carrito', () => {
  // Esto es lo que hace que persistir el carrito no sea mentir.
  const subio = { ...BARAJA, precio: 70000 };
  const resultado = sincronizarConCatalogo({ items: ITEMS, mensaje: '' }, [subio, TAPETE]);

  assert.equal(resultado.items[0].producto.precio, 70000);
});

test('un producto que ya no está en el catálogo se cae del carrito', () => {
  const resultado = sincronizarConCatalogo({ items: ITEMS, mensaje: '' }, [BARAJA]);

  assert.equal(resultado.items.length, 1);
  assert.equal(resultado.items[0].producto._id, 'p1');
  assert.equal(resultado.mensaje, 'Se quitó un producto del carrito porque ya no está disponible.');
});

test('con varios desaparecidos el mensaje va en plural', () => {
  const resultado = sincronizarConCatalogo({ items: ITEMS, mensaje: '' }, []);

  assert.equal(
    resultado.mensaje,
    'Se quitaron 2 productos del carrito porque ya no están disponibles.',
  );
});

test('la cantidad se recorta a lo que queda en stock', () => {
  const casiAgotada = { ...BARAJA, stock: 1 };
  const resultado = sincronizarConCatalogo({ items: ITEMS, mensaje: '' }, [casiAgotada, TAPETE]);

  assert.equal(resultado.items[0].cantidad, 1);
});

test('lo que se quedó sin stock se cae del carrito', () => {
  const agotada = { ...BARAJA, stock: 0 };
  const resultado = sincronizarConCatalogo({ items: ITEMS, mensaje: '' }, [agotada, TAPETE]);

  assert.deepEqual(resultado.items.map((i) => i.producto._id), ['p2']);
});

test('si nada cambió se devuelve el mismo estado, sin render de más', () => {
  const estado = { items: ITEMS, mensaje: 'algo' };

  assert.equal(sincronizarConCatalogo(estado, [BARAJA, TAPETE]), estado);
});

test('un catálogo que no llegó no vacía el carrito', () => {
  // Si la API falla, `productos` puede no ser una lista. Borrar el carrito
  // por un fallo de red sería lo peor que podría hacer.
  const estado = { items: ITEMS, mensaje: '' };

  for (const malo of [undefined, null, 'error']) {
    assert.equal(sincronizarConCatalogo(estado, malo), estado, String(malo));
  }
});

test('el reducer entiende la acción de sincronizar', () => {
  const resultado = carritoReducer(
    { items: ITEMS, mensaje: '' },
    { type: 'carrito/sincronizado', productos: [BARAJA] },
  );

  assert.equal(resultado.items.length, 1);
});
