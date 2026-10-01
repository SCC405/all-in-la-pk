import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hayErrores,
  LIMITES,
  primerCampoConError,
  validarCategoria,
  validarProducto,
} from '../src/utils/validaciones.js';

const CATEGORIA_VALIDA = { nombre: 'Fichas de póker', descripcion: 'Fichas sueltas.' };

const PRODUCTO_VALIDO = {
  nombre: 'Set de 500 fichas',
  categoria: 'c1',
  precio: '320000',
  stock: '12',
  imagen: 'https://ejemplo.com/set.jpg',
  descripcion: 'Maletín de aluminio.',
};

// ---------- categorías ----------

test('una categoría válida no produce errores', () => {
  assert.deepEqual(validarCategoria(CATEGORIA_VALIDA), {});
});

test('el nombre de la categoría es obligatorio', () => {
  assert.equal(
    validarCategoria({ ...CATEGORIA_VALIDA, nombre: '' }).nombre,
    'El nombre de la categoría es obligatorio.',
  );
});

test('un nombre de solo espacios cuenta como vacío', () => {
  // Es lo que hace `trim` en el esquema del backend: conviene que el cliente
  // opine lo mismo, o el usuario vería un error distinto según quién valide.
  assert.ok(validarCategoria({ nombre: '    ' }).nombre);
});

test('se respeta el límite de longitud del nombre', () => {
  const errores = validarCategoria({ nombre: 'P'.repeat(LIMITES.categoriaNombre + 1) });

  assert.match(errores.nombre, /no puede superar los 60 caracteres/);
});

// ---------- productos ----------

test('un producto válido no produce errores', () => {
  assert.deepEqual(validarProducto(PRODUCTO_VALIDO), {});
});

test('todos los campos obligatorios se señalan a la vez', () => {
  const errores = validarProducto({});

  assert.deepEqual(Object.keys(errores).sort(), ['categoria', 'imagen', 'nombre', 'precio', 'stock']);
});

test('la categoría sin elegir se señala en su campo, no como error general', () => {
  // Antes el servidor respondía "La categoría indicada no existe" sin decir
  // qué campo, y el selector no quedaba marcado.
  assert.equal(
    validarProducto({ ...PRODUCTO_VALIDO, categoria: '' }).categoria,
    'La categoría del producto es obligatoria.',
  );
});

test('el precio no admite negativos ni texto', () => {
  assert.equal(validarProducto({ ...PRODUCTO_VALIDO, precio: '-1' }).precio, 'El precio no puede ser negativo.');
  assert.match(validarProducto({ ...PRODUCTO_VALIDO, precio: 'abc' }).precio, /número finito/);
});

test('el precio admite decimales y el cero', () => {
  assert.equal(validarProducto({ ...PRODUCTO_VALIDO, precio: '1500.5' }).precio, undefined);
  assert.equal(validarProducto({ ...PRODUCTO_VALIDO, precio: '0' }).precio, undefined);
});

test('el stock debe ser un entero no negativo', () => {
  assert.equal(validarProducto({ ...PRODUCTO_VALIDO, stock: '2.5' }).stock, 'El stock debe ser un número entero.');
  assert.equal(validarProducto({ ...PRODUCTO_VALIDO, stock: '-3' }).stock, 'El stock no puede ser negativo.');
  assert.equal(validarProducto({ ...PRODUCTO_VALIDO, stock: '0' }).stock, undefined);
});

test('un número vacío se reporta como obligatorio, no como inválido', () => {
  // Number('') es 0: sin el descarte previo, un precio vacío pasaría como válido.
  assert.equal(validarProducto({ ...PRODUCTO_VALIDO, precio: '' }).precio, 'El precio es obligatorio.');
  assert.equal(validarProducto({ ...PRODUCTO_VALIDO, stock: '  ' }).stock, 'El stock es obligatorio.');
});

test('la descripción es opcional pero tiene límite', () => {
  assert.equal(validarProducto({ ...PRODUCTO_VALIDO, descripcion: '' }).descripcion, undefined);
  assert.match(
    validarProducto({ ...PRODUCTO_VALIDO, descripcion: 'x'.repeat(LIMITES.productoDescripcion + 1) }).descripcion,
    /no puede superar los 1000 caracteres/,
  );
});

// ---------- ayudas ----------

test('hayErrores distingue el objeto vacío', () => {
  assert.equal(hayErrores({}), false);
  assert.equal(hayErrores({ nombre: 'falta' }), true);
});

test('primerCampoConError respeta el orden de la pantalla', () => {
  const errores = { stock: 'x', nombre: 'y', categoria: 'z' };
  const orden = ['nombre', 'categoria', 'precio', 'stock', 'imagen'];

  assert.equal(primerCampoConError(errores, orden), 'nombre');
  assert.equal(primerCampoConError({ stock: 'x' }, orden), 'stock');
  assert.equal(primerCampoConError({}, orden), null);
});

// ---------- coherencia con el backend ----------

test('los mensajes coinciden palabra por palabra con los del esquema', () => {
  // Si divergen, el administrador vería dos textos distintos para el mismo
  // fallo según lo detecte el cliente o el servidor.
  const delBackend = [
    'El nombre de la categoría es obligatorio.',
    'El nombre del producto es obligatorio.',
    'El precio es obligatorio.',
    'El precio no puede ser negativo.',
    'El precio debe ser un número finito.',
    'El stock es obligatorio.',
    'El stock no puede ser negativo.',
    'El stock debe ser un número entero.',
    'La imagen del producto es obligatoria.',
    'La categoría del producto es obligatoria.',
  ];

  const delCliente = new Set([
    validarCategoria({}).nombre,
    validarProducto({}).nombre,
    validarProducto({}).precio,
    validarProducto({ ...PRODUCTO_VALIDO, precio: '-1' }).precio,
    validarProducto({ ...PRODUCTO_VALIDO, precio: 'abc' }).precio,
    validarProducto({}).stock,
    validarProducto({ ...PRODUCTO_VALIDO, stock: '-1' }).stock,
    validarProducto({ ...PRODUCTO_VALIDO, stock: '1.5' }).stock,
    validarProducto({}).imagen,
    validarProducto({}).categoria,
  ]);

  for (const mensaje of delBackend) {
    assert.ok(delCliente.has(mensaje), `el cliente no dice exactamente: "${mensaje}"`);
  }
});
