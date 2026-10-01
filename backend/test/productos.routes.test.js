import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Categoria from '../src/models/categoria.model.js';
import Producto from '../src/models/producto.model.js';
import { MOTIVO_SIN_BASE, uriDePruebas } from './ayuda-base-de-datos.js';
import { cabecerasCsrf, obtenerCsrf } from './ayuda-csrf.js';

const URI = uriDePruebas();

test('CRUD REST de productos', { skip: URI ? false : MOTIVO_SIN_BASE }, async (suite) => {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 5_000 });
  await Promise.all([Categoria.init(), Producto.init()]);

  const servidor = await new Promise((resolve, reject) => {
    const instancia = app.listen(0, '127.0.0.1', () => resolve(instancia));
    instancia.on('error', reject);
  });
  const origen = `http://127.0.0.1:${servidor.address().port}`;
  const base = `${origen}/api/productos`;

  // Con la proteccion CSRF activa, toda mutacion necesita el par cookie+cabecera.
  const csrf = await obtenerCsrf(origen);
  const borrar = () => ({ method: 'DELETE', headers: cabecerasCsrf(csrf) });

  suite.after(async () => {
    await new Promise((resolve) => servidor.close(resolve));
    try {
      await Promise.all([Producto.deleteMany({}), Categoria.deleteMany({})]);
    } finally {
      await mongoose.disconnect();
    }
  });

  suite.beforeEach(async () => {
    await Promise.all([Producto.deleteMany({}), Categoria.deleteMany({})]);
  });

  const json = (cuerpo) => ({
    method: 'POST',
    headers: cabecerasCsrf(csrf),
    body: JSON.stringify(cuerpo),
  });

  async function crearCategoria(nombre = 'Fichas') {
    return Categoria.create({ nombre });
  }

  function datosProducto(categoria, cambios = {}) {
    return {
      nombre: 'Set de 500 fichas',
      descripcion: 'Maletín de aluminio.',
      precio: 249900,
      stock: 8,
      imagen: 'https://ejemplo.com/set.webp',
      categoria: categoria._id.toString(),
      ...cambios,
    };
  }

  await suite.test('POST crea un producto asociado a su categoría y responde 201', async () => {
    const categoria = await crearCategoria();
    const respuesta = await fetch(base, json(datosProducto(categoria)));
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 201);
    assert.equal(cuerpo.nombre, 'Set de 500 fichas');
    assert.equal(cuerpo.categoria._id, categoria._id.toString());
    assert.equal(await Producto.countDocuments({ categoria: categoria._id }), 1);
  });

  await suite.test('POST rechaza precio o stock inválidos con detalle por campo', async () => {
    const categoria = await crearCategoria();
    const respuesta = await fetch(base, json(datosProducto(categoria, { precio: -1, stock: 1.5 })));
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 400);
    assert.equal(cuerpo.detalles.precio, 'El precio no puede ser negativo.');
    assert.equal(cuerpo.detalles.stock, 'El stock debe ser un número entero.');
    assert.equal(await Producto.countDocuments(), 0);
  });

  await suite.test('POST rechaza una categoría que no existe', async () => {
    const categoriaAusente = { _id: new mongoose.Types.ObjectId() };
    const respuesta = await fetch(base, json(datosProducto(categoriaAusente)));

    assert.equal(respuesta.status, 400);
    assert.equal((await respuesta.json()).error, 'La categoría indicada no existe');
    assert.equal(await Producto.countDocuments(), 0);
  });

  await suite.test('POST ignora campos reservados', async () => {
    const categoria = await crearCategoria();
    const idInventado = new mongoose.Types.ObjectId().toString();
    const respuesta = await fetch(base, json(datosProducto(categoria, { _id: idInventado })));
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 201);
    assert.notEqual(cuerpo._id, idInventado);
  });

  await suite.test('GET lista productos ordenados y con su categoría', async () => {
    const categoria = await crearCategoria();
    await Producto.create([
      datosProducto(categoria, { nombre: 'Tapete profesional' }),
      datosProducto(categoria, { nombre: 'Baraja plástica' }),
    ]);

    const respuesta = await fetch(base);
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.deepEqual(cuerpo.map((producto) => producto.nombre), ['Baraja plástica', 'Tapete profesional']);
    assert.equal(cuerpo[0].categoria.nombre, 'Fichas');
  });

  await suite.test('GET individual devuelve el producto solicitado', async () => {
    const categoria = await crearCategoria();
    const producto = await Producto.create(datosProducto(categoria));

    const respuesta = await fetch(`${base}/${producto._id}`);
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.equal(cuerpo._id, producto._id.toString());
    assert.equal(cuerpo.categoria.nombre, 'Fichas');
  });

  await suite.test('GET individual responde 404 cuando el producto no existe', async () => {
    const respuesta = await fetch(`${base}/${new mongoose.Types.ObjectId()}`);

    assert.equal(respuesta.status, 404);
    assert.equal((await respuesta.json()).error, 'Producto no encontrado');
  });

  await suite.test('PUT actualiza el producto y puede cambiar su categoría', async () => {
    const categoriaInicial = await crearCategoria('Fichas');
    const categoriaNueva = await crearCategoria('Cartas');
    const producto = await Producto.create(datosProducto(categoriaInicial));

    const respuesta = await fetch(`${base}/${producto._id}`, {
      ...json({ precio: 199900, stock: 4, categoria: categoriaNueva._id.toString() }),
      method: 'PUT',
    });
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.equal(cuerpo.precio, 199900);
    assert.equal(cuerpo.categoria._id, categoriaNueva._id.toString());

    const guardado = await Producto.findById(producto._id).lean();
    assert.equal(guardado.stock, 4);
    assert.equal(guardado.categoria.toString(), categoriaNueva._id.toString());
  });

  await suite.test('PUT inválido responde 400 y no altera el producto', async () => {
    const categoria = await crearCategoria();
    const producto = await Producto.create(datosProducto(categoria));

    const respuesta = await fetch(`${base}/${producto._id}`, {
      ...json({ precio: -500 }),
      method: 'PUT',
    });

    assert.equal(respuesta.status, 400);
    assert.equal((await Producto.findById(producto._id)).precio, 249900);
  });

  await suite.test('PUT responde 404 cuando el producto no existe', async () => {
    const respuesta = await fetch(`${base}/${new mongoose.Types.ObjectId()}`, {
      ...json({ stock: 1 }),
      method: 'PUT',
    });

    assert.equal(respuesta.status, 404);
  });

  await suite.test('DELETE elimina el producto y responde 204 sin cuerpo', async () => {
    const categoria = await crearCategoria();
    const producto = await Producto.create(datosProducto(categoria));

    const respuesta = await fetch(`${base}/${producto._id}`, borrar());

    assert.equal(respuesta.status, 204);
    assert.equal(await respuesta.text(), '');
    assert.equal(await Producto.findById(producto._id), null);
  });

  await suite.test('un identificador inválido responde 400, no 500', async () => {
    const respuesta = await fetch(`${base}/no-es-un-id`);

    assert.equal(respuesta.status, 400);
    assert.equal((await respuesta.json()).error, 'El identificador recibido no es válido');
  });
});
