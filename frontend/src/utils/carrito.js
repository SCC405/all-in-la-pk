export const ESTADO_INICIAL_CARRITO = {
  items: [],
  mensaje: '',
};

export function agregarProductoAlCarrito(estado, producto) {
  if (!producto?._id || producto.stock <= 0) {
    return {
      ...estado,
      mensaje: 'Este producto no está disponible para agregarlo al carrito.',
    };
  }

  const indice = estado.items.findIndex((item) => item.producto._id === producto._id);

  if (indice === -1) {
    return {
      items: [...estado.items, { producto, cantidad: 1 }],
      mensaje: `${producto.nombre} se agregó al carrito.`,
    };
  }

  const itemActual = estado.items[indice];
  if (itemActual.cantidad >= producto.stock) {
    return {
      ...estado,
      mensaje: `No hay más unidades disponibles de ${producto.nombre}.`,
    };
  }

  return {
    items: estado.items.map((item, posicion) => (
      posicion === indice ? { ...item, cantidad: item.cantidad + 1 } : item
    )),
    mensaje: `Se agregó otra unidad de ${producto.nombre} al carrito.`,
  };
}

export function contarUnidades(items) {
  return items.reduce((total, item) => total + item.cantidad, 0);
}

export function carritoReducer(estado, accion) {
  switch (accion.type) {
    case 'producto/agregado':
      return agregarProductoAlCarrito(estado, accion.producto);
    default:
      return estado;
  }
}
