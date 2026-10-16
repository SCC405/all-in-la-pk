import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Categoria from '../src/models/categoria.model.js';
import { MOTIVO_SIN_BASE, uriDePruebas } from './ayuda-base-de-datos.js';

// Estas pruebas necesitan un MongoDB real. Se saltan cuando no hay uno disponible
// para que `npm test` siga pasando en una máquina recién clonada.
//
// Para ejecutarlas:
//   MONGODB_URI_TEST=mongodb://localhost:27017/all_in_la_pk_test npm test
const URI = uriDePruebas();

test('una categoría creada queda almacenada de forma persistente', { skip: URI ? false : MOTIVO_SIN_BASE }, async (context) => {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 5_000 });
  context.after(async () => {
    try {
      await Categoria.deleteMany({});
    } finally {
      await mongoose.disconnect();
    }
  });

  await Categoria.init(); // asegura que el índice único exista antes de insertar
  await Categoria.deleteMany({});

  const creada = await Categoria.create({
    nombre: 'Fichas de póker',
    descripcion: 'Fichas sueltas y por juegos completos.',
  });

  // Se relee desde la base de datos, no desde el objeto que devolvió create().
  const recuperada = await Categoria.findById(creada._id).lean();

  assert.ok(recuperada, 'la categoría debería existir en la base de datos');
  assert.equal(recuperada.nombre, 'Fichas de póker');
  assert.equal(recuperada.descripcion, 'Fichas sueltas y por juegos completos.');
  assert.ok(recuperada.createdAt instanceof Date);

  await assert.rejects(
    Categoria.create({ nombre: 'Fichas de póker' }),
    (error) => error.code === 11000,
    'no debería permitirse una segunda categoría con el mismo nombre',
  );
});
