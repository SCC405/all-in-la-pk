import Categoria from '../models/categoria.model.js';
import Producto from '../models/producto.model.js';

// Solo estos campos se aceptan del cuerpo de la petición: evita que un cliente
// intente escribir _id, createdAt o cualquier otra cosa que no le corresponde.
function camposPermitidos(cuerpo = {}) {
  const datos = {};

  if (cuerpo.nombre !== undefined) datos.nombre = cuerpo.nombre;
  if (cuerpo.descripcion !== undefined) datos.descripcion = cuerpo.descripcion;

  return datos;
}

export async function listarCategorias(_request, response, next) {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 }).lean();
    response.status(200).json(categorias);
  } catch (error) {
    next(error);
  }
}

export async function crearCategoria(request, response, next) {
  try {
    const categoria = await Categoria.create(camposPermitidos(request.body));
    response.status(201).json(categoria);
  } catch (error) {
    next(error);
  }
}

export async function actualizarCategoria(request, response, next) {
  try {
    const categoria = await Categoria.findById(request.params.id);

    if (!categoria) {
      response.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    // Se asigna sobre el documento y se guarda, en vez de usar findByIdAndUpdate:
    // así corren todas las validaciones del esquema, no solo las de los campos enviados.
    categoria.set(camposPermitidos(request.body));
    await categoria.save();

    response.status(200).json(categoria);
  } catch (error) {
    next(error);
  }
}

export async function eliminarCategoria(request, response, next) {
  try {
    const { id } = request.params;

    // Se comprueba ANTES de borrar: si se borrara primero, los productos quedarían
    // apuntando a una categoría inexistente y `populate` devolvería null, con lo que
    // el catálogo mostraría productos sin categoría y los filtros no los encontrarían.
    const productosAsociados = await Producto.countDocuments({ categoria: id });

    if (productosAsociados > 0) {
      response.status(409).json({
        error:
          `No se puede eliminar la categoría porque tiene ${productosAsociados} ` +
          `producto(s) asociado(s). Cámbialos de categoría o elimínalos primero.`,
      });
      return;
    }

    const categoria = await Categoria.findByIdAndDelete(id);

    if (!categoria) {
      response.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
}
