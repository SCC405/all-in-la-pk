export function filtrarProductosPorCategoria(productos, categoriaId) {
  if (!categoriaId) return productos;

  return productos.filter((producto) => {
    const categoriaProducto = producto.categoria?._id ?? producto.categoria;
    return categoriaProducto === categoriaId;
  });
}
