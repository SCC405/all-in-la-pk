import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Categoria from '../src/models/categoria.model.js';
import Producto from '../src/models/producto.model.js';
import { MOTIVO_SIN_BASE, uriDePruebas } from './ayuda-base-de-datos.js';
import { cabecerasCsrf, obtenerCsrf } from './ayuda-csrf.js';

// Prueba el CRUD completo contra un MongoDB real. Se salta cuando no hay uno,
// para que `npm test` siga pasando en un clon recién hecho.
//
//   MONGODB_URI_TEST=mongodb://localhost:27017/all_in_la_pk_test npm test
const URI = uriDePruebas();

test('CRUD REST de categorías', { skip: URI ? false : MOTIVO_SIN_BASE }, async (suite) => {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 5_000 });
  await Categoria.init();

  const servidor = await new Promise((resolve, reject) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
    s.on('error', reject);
  });
  const origen = `http://127.0.0.1:${servidor.address().port}`;
  const base = `${origen}/api/categorias`;

  // Con la proteccion CSRF activa, toda mutacion necesita el par cookie+cabecera.
  const csrf = await obtenerCsrf(origen);
  const borrar = () => ({ method: 'DELETE', headers: cabecerasCsrf(csrf) });

  suite.after(async () => {
    await new Promise((resolve) => servidor.close(resolve));
    try {
      await Categoria.deleteMany({});
    } finally {
      await mongoose.disconnect();
    }
  });

  suite.beforeEach(async () => {
    await Producto.deleteMany({});
    await Categoria.deleteMany({});
  });

  const json = (cuerpo) => ({
    method: 'POST',
    headers: cabecerasCsrf(csrf),
    body: JSON.stringify(cuerpo),
  });

  await suite.test('POST crea una categoría y responde 201', async () => {
    const respuesta = await fetch(base, json({ nombre: 'Fichas de póker', descripcion: 'Sueltas y en sets.' }));
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 201);
    assert.equal(cuerpo.nombre, 'Fichas de póker');
    assert.ok(cuerpo._id);

    // Se comprueba en la base de datos, no solo en la respuesta.
    assert.equal(await Categoria.countDocuments({ nombre: 'Fichas de póker' }), 1);
  });

  await suite.test('POST sin nombre responde 400 con el detalle del campo', async () => {
    const respuesta = await fetch(base, json({ descripcion: 'sin nombre' }));
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 400);
    assert.equal(cuerpo.detalles.nombre, 'El nombre de la categoría es obligatorio.');
    assert.equal(await Categoria.countDocuments(), 0);
  });

  await suite.test('POST con un nombre repetido responde 409', async () => {
    await fetch(base, json({ nombre: 'Tapetes' }));
    const respuesta = await fetch(base, json({ nombre: 'Tapetes' }));

    assert.equal(respuesta.status, 409);
    assert.equal(await Categoria.countDocuments({ nombre: 'Tapetes' }), 1);
  });

  await suite.test('POST ignora campos que no le corresponden al cliente', async () => {
    const idInventado = new mongoose.Types.ObjectId().toString();
    const respuesta = await fetch(base, json({ nombre: 'Maletines', _id: idInventado }));
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 201);
    assert.notEqual(cuerpo._id, idInventado);
  });

  await suite.test('GET lista las categorías ordenadas por nombre', async () => {
    await Categoria.create([{ nombre: 'Tapetes' }, { nombre: 'Cartas y barajas' }]);

    const respuesta = await fetch(base);
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.deepEqual(cuerpo.map((c) => c.nombre), ['Cartas y barajas', 'Tapetes']);
  });

  await suite.test('GET devuelve una lista vacía cuando no hay categorías', async () => {
    const respuesta = await fetch(base);

    assert.equal(respuesta.status, 200);
    assert.deepEqual(await respuesta.json(), []);
  });

  await suite.test('PUT actualiza una categoría existente y responde 200', async () => {
    const creada = await Categoria.create({ nombre: 'Mesas', descripcion: 'Antigua' });

    const respuesta = await fetch(`${base}/${creada._id}`, {
      ...json({ nombre: 'Mesas de póker', descripcion: 'Plegables y profesionales.' }),
      method: 'PUT',
    });
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.equal(cuerpo.nombre, 'Mesas de póker');

    const enBaseDeDatos = await Categoria.findById(creada._id).lean();
    assert.equal(enBaseDeDatos.nombre, 'Mesas de póker');
    assert.equal(enBaseDeDatos.descripcion, 'Plegables y profesionales.');
  });

  await suite.test('PUT con datos inválidos responde 400 y no altera la categoría', async () => {
    const creada = await Categoria.create({ nombre: 'Botones de dealer' });

    const respuesta = await fetch(`${base}/${creada._id}`, { ...json({ nombre: '   ' }), method: 'PUT' });

    assert.equal(respuesta.status, 400);
    assert.equal((await Categoria.findById(creada._id)).nombre, 'Botones de dealer');
  });

  await suite.test('PUT sobre una categoría inexistente responde 404', async () => {
    const idAusente = new mongoose.Types.ObjectId().toString();

    const respuesta = await fetch(`${base}/${idAusente}`, { ...json({ nombre: 'Fantasma' }), method: 'PUT' });

    assert.equal(respuesta.status, 404);
    assert.equal((await respuesta.json()).error, 'Categoría no encontrada');
  });

  await suite.test('DELETE elimina la categoría y responde 204 sin cuerpo', async () => {
    const creada = await Categoria.create({ nombre: 'Porta fichas' });

    const respuesta = await fetch(`${base}/${creada._id}`, borrar());

    assert.equal(respuesta.status, 204);
    assert.equal(await respuesta.text(), '');
    assert.equal(await Categoria.findById(creada._id), null);
  });

  await suite.test('DELETE responde 409 si la categoría tiene productos, y no la borra', async () => {
    const categoria = await Categoria.create({ nombre: 'Tapetes' });
    await Producto.create({
      nombre: 'Tapete verde profesional',
      precio: 80000,
      stock: 5,
      imagen: 'https://ejemplo.com/tapete.jpg',
      categoria: categoria._id,
    });

    const respuesta = await fetch(`${base}/${categoria._id}`, borrar());

    assert.equal(respuesta.status, 409);
    assert.match((await respuesta.json()).error, /1 producto\(s\) asociado\(s\)/);

    // Ni la categoría se borró, ni el producto quedó huérfano.
    assert.ok(await Categoria.findById(categoria._id));
    assert.equal(await Producto.countDocuments({ categoria: categoria._id }), 1);
  });

  await suite.test('DELETE funciona una vez que la categoría se queda sin productos', async () => {
    const categoria = await Categoria.create({ nombre: 'Maletines' });
    const producto = await Producto.create({
      nombre: 'Maletín de aluminio',
      precio: 150000,
      stock: 2,
      imagen: 'https://ejemplo.com/maletin.jpg',
      categoria: categoria._id,
    });

    assert.equal((await fetch(`${base}/${categoria._id}`, borrar())).status, 409);

    await Producto.findByIdAndDelete(producto._id);

    assert.equal((await fetch(`${base}/${categoria._id}`, borrar())).status, 204);
    assert.equal(await Categoria.findById(categoria._id), null);
  });

  await suite.test('DELETE sobre una categoría inexistente responde 404', async () => {
    const idAusente = new mongoose.Types.ObjectId().toString();

    const respuesta = await fetch(`${base}/${idAusente}`, borrar());

    assert.equal(respuesta.status, 404);
  });

  await suite.test('un identificador con forma inválida responde 400, no 500', async () => {
    const respuesta = await fetch(`${base}/no-es-un-id`, borrar());

    assert.equal(respuesta.status, 400);
    assert.equal((await respuesta.json()).error, 'El identificador recibido no es válido');
  });
});
