// Llena la base de datos con categorías y productos de ejemplo.
//
//   npm run sembrar
//
// Sirve para ver la tienda con contenido tras una instalación limpia y para
// tener datos preparados en la sustentación. Va directo a MongoDB, no a la API,
// así que no necesita el servidor levantado ni token CSRF.
//
// Borra lo que haya antes: es un sembrado, no una migración.

import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import Categoria from '../src/models/categoria.model.js';
import Producto from '../src/models/producto.model.js';

const CATEGORIAS = [
  { nombre: 'Cartas y barajas', descripcion: 'Barajas de plástico y de cartón para partidas de todo tipo.' },
  { nombre: 'Fichas de póker', descripcion: 'Fichas sueltas y juegos de reposición.' },
  { nombre: 'Sets de póker', descripcion: 'Juegos completos con maletín, fichas y barajas.' },
  { nombre: 'Tapetes', descripcion: 'Superficies de juego antideslizantes.' },
  { nombre: 'Maletines', descripcion: 'Estuches para guardar y transportar el set.' },
];

// La imagen se deja como una URL de ejemplo: el catálogo cae a un marcador
// cuando no carga, así que sirve igual para ver la tienda con contenido.
const PRODUCTOS = [
  ['Baraja Bicycle Rider Back', 'Baraja clásica de póker, dorso rojo, acabado Air-Cushion.', 18000, 40, 'Cartas y barajas'],
  ['Baraja Copag 100% plástico', 'Resistente al agua, ideal para partidas largas.', 62000, 7, 'Cartas y barajas'],
  ['Fichas de arcilla, 100 unidades', 'Juego de reposición en cuatro denominaciones.', 85000, 0, 'Fichas de póker'],
  ['Fichas profesionales de 14 g', 'Peso y tacto de casino, cuatro colores.', 120000, 25, 'Fichas de póker'],
  ['Set de 200 fichas con maletín', 'Set de iniciación con dos barajas y botón de dealer.', 175000, 3, 'Sets de póker'],
  ['Set de 500 fichas profesionales', 'Fichas de arcilla en maletín de aluminio con cierre.', 320000, 12, 'Sets de póker'],
  ['Tapete verde profesional 180 cm', 'Neopreno antideslizante con posiciones marcadas.', 95000, 4, 'Tapetes'],
  ['Maletín de aluminio reforzado', 'Interior acolchado para 500 fichas.', 150000, 6, 'Maletines'],
];

async function sembrar() {
  await connectDatabase(env.mongodbUri);

  const nombreBase = mongoose.connection.name;
  const yaHay = await Promise.all([Categoria.countDocuments(), Producto.countDocuments()]);
  const total = yaHay[0] + yaHay[1];

  // Este script borra lo que haya. Si la base ya tiene datos hay que decirlo a
  // propósito: el .env de cualquiera puede apuntar al Atlas compartido, y un
  // "npm run sembrar" distraído se llevaría por delante el catálogo real.
  if (total > 0 && !process.argv.includes('--confirmar')) {
    throw new Error(
      `La base "${nombreBase}" ya tiene ${yaHay[0]} categoría(s) y ${yaHay[1]} producto(s), ` +
        'y sembrar las borra todas.\n' +
        'Si es lo que quieres, vuelve a ejecutarlo con --confirmar:\n' +
        '  npm run sembrar -- --confirmar',
    );
  }

  console.log(`Sembrando la base "${nombreBase}"...`);

  await Promise.all([Producto.deleteMany({}), Categoria.deleteMany({})]);

  const categorias = await Categoria.create(CATEGORIAS);
  const porNombre = new Map(categorias.map((categoria) => [categoria.nombre, categoria._id]));

  await Producto.create(
    PRODUCTOS.map(([nombre, descripcion, precio, stock, categoria]) => ({
      nombre,
      descripcion,
      precio,
      stock,
      imagen: `https://ejemplo.com/${nombre.toLowerCase().replaceAll(' ', '-')}.jpg`,
      categoria: porNombre.get(categoria),
    })),
  );

  console.log(`Listo: ${categorias.length} categorías y ${PRODUCTOS.length} productos.`);
}

try {
  await sembrar();
} catch (error) {
  console.error(`No fue posible sembrar los datos: ${error.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
