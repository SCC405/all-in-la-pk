import Categoria from '../models/categoria.model.js';
import Producto from '../models/producto.model.js';

function camposPermitidos(cuerpo = {}) {
  const datos = {};

  for (const campo of ['nombre', 'descripcion', 'precio', 'stock', 'imagen', 'categoria']) {
    if (cuerpo[campo] !== undefined) datos[campo] = cuerpo[campo];
  }

  return datos;
}

async function categoriaExiste(id) {
  if (id === undefined || id === null || id === '') return false;
  return Boolean(await Categoria.exists({ _id: id }));
}

function categoriaNoEncontrada(response) {
  response.status(400).json({ error: 'La categoría indicada no existe' });
}

export async function listarProductos(_request, response, next) {
  try {
    const productos = await Producto.find()
      .sort({ nombre: 1 })
      .populate('categoria', 'nombre descripcion')
      .lean();
    response.status(200).json(productos);
  } catch (error) {
    next(error);
  }
}

export async function obtenerProducto(request, response, next) {
  try {
    const producto = await Producto.findById(request.params.id)
      .populate('categoria', 'nombre descripcion')
      .lean();

    if (!producto) {
      response.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    response.status(200).json(producto);
  } catch (error) {
    next(error);
  }
}

export async function crearProducto(request, response, next) {
  try {
    const datos = camposPermitidos(request.body);

    if (datos.categoria !== undefined && !(await categoriaExiste(datos.categoria))) {
      categoriaNoEncontrada(response);
      return;
    }

    const producto = await Producto.create(datos);
    await producto.populate('categoria', 'nombre descripcion');
    response.status(201).json(producto);
  } catch (error) {
    next(error);
  }
}

export async function actualizarProducto(request, response, next) {
  try {
    const producto = await Producto.findById(request.params.id);

    if (!producto) {
      response.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const datos = camposPermitidos(request.body);

    if (datos.categoria !== undefined && !(await categoriaExiste(datos.categoria))) {
      categoriaNoEncontrada(response);
      return;
    }

    producto.set(datos);
    await producto.save();
    await producto.populate('categoria', 'nombre descripcion');
    response.status(200).json(producto);
  } catch (error) {
    next(error);
  }
}

export async function eliminarProducto(request, response, next) {
  try {
    const producto = await Producto.findByIdAndDelete(request.params.id);

    if (!producto) {
      response.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
}
