import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ordenarProductosPorNombre,
  prepararProducto,
  productoAFormulario,
  quitarProducto,
  reemplazarProducto,
} from '../src/utils/productosFormulario.js';

test('prepara precio y stock como números para enviarlos a la API', () => {
  const datos = prepararProducto({
    nombre: 'Baraja',
    descripcion: 'Plástica',
    precio: '45000',
    stock: '12',
    imagen: 'https://ejemplo.com/baraja.jpg',
    categoria: 'categoria-1',
  });

  assert.equal(datos.precio, 45000);
  assert.equal(datos.stock, 12);
  assert.equal(datos.categoria, 'categoria-1');
});

test('elimina de la lista únicamente el producto indicado', () => {
  const productos = [
    { _id: '1', nombre: 'Baraja' },
    { _id: '2', nombre: 'Fichas' },
  ];

  assert.deepEqual(quitarProducto(productos, '1'), [{ _id: '2', nombre: 'Fichas' }]);
});

test('conserva campos numéricos vacíos como null para que la API los valide', () => {
  const datos = prepararProducto({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen: '',
    categoria: '',
  });

  assert.equal(datos.precio, null);
  assert.equal(datos.stock, null);
  assert.equal('categoria' in datos, false);
});

test('convierte un producto de la API al formato editable del formulario', () => {
  const formulario = productoAFormulario({
    nombre: 'Fichas',
    descripcion: 'Set completo',
    precio: 120000,
    stock: 5,
    imagen: 'https://ejemplo.com/fichas.jpg',
    categoria: { _id: 'categoria-2', nombre: 'Fichas' },
  });

  assert.equal(formulario.precio, '120000');
  assert.equal(formulario.stock, '5');
  assert.equal(formulario.categoria, 'categoria-2');
});

test('reemplaza el producto actualizado y mantiene la lista ordenada', () => {
  const productos = [
    { _id: '1', nombre: 'Mesa' },
    { _id: '2', nombre: 'Baraja' },
  ];
  const actualizados = reemplazarProducto(productos, { _id: '1', nombre: 'Accesorios' });

  assert.deepEqual(actualizados.map((producto) => producto.nombre), ['Accesorios', 'Baraja']);
  assert.deepEqual(
    ordenarProductosPorNombre([{ nombre: 'Tapete' }, { nombre: 'Fichas' }]).map((p) => p.nombre),
    ['Fichas', 'Tapete'],
  );
});
