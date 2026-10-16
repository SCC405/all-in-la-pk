export const FORMULARIO_PRODUCTO_VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  imagen: '',
  categoria: '',
};

function convertirNumero(valor) {
  return valor === '' ? null : Number(valor);
}

export function prepararProducto(formulario) {
  const producto = {
    nombre: formulario.nombre,
    descripcion: formulario.descripcion,
    precio: convertirNumero(formulario.precio),
    stock: convertirNumero(formulario.stock),
    imagen: formulario.imagen,
  };

  if (formulario.categoria) {
    producto.categoria = formulario.categoria;
  }

  return producto;
}

export function productoAFormulario(producto) {
  return {
    nombre: producto.nombre ?? '',
    descripcion: producto.descripcion ?? '',
    precio: String(producto.precio ?? ''),
    stock: String(producto.stock ?? ''),
    imagen: producto.imagen ?? '',
    categoria: producto.categoria?._id ?? producto.categoria ?? '',
  };
}

export function ordenarProductosPorNombre(productos) {
  return [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export function reemplazarProducto(productos, actualizado) {
  return ordenarProductosPorNombre(
    productos.map((producto) => (producto._id === actualizado._id ? actualizado : producto)),
  );
}

export function quitarProducto(productos, productoId) {
  return productos.filter((producto) => producto._id !== productoId);
}
