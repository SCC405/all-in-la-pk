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

export const CANTIDAD_MINIMA = 1;

function buscarItem(estado, productoId) {
  return estado.items.find((item) => item.producto._id === productoId);
}

function reemplazarCantidad(estado, productoId, cantidad, mensaje) {
  return {
    items: estado.items.map((item) => (
      item.producto._id === productoId ? { ...item, cantidad } : item
    )),
    mensaje,
  };
}

export function aumentarCantidad(estado, productoId) {
  const item = buscarItem(estado, productoId);

  if (!item) return estado;

  // Mismo limite que al agregar: no se puede pedir mas de lo que hay en stock.
  if (item.cantidad >= item.producto.stock) {
    return {
      ...estado,
      mensaje: `No hay más unidades disponibles de ${item.producto.nombre}.`,
    };
  }

  const cantidad = item.cantidad + 1;

  return reemplazarCantidad(
    estado,
    productoId,
    cantidad,
    `${item.producto.nombre}: ${cantidad} unidades.`,
  );
}

export function disminuirCantidad(estado, productoId) {
  const item = buscarItem(estado, productoId);

  if (!item) return estado;

  // Llegado al minimo no se baja a cero: para quitarlo esta el boton de quitar,
  // asi nadie elimina un producto del carrito sin querer.
  if (item.cantidad <= CANTIDAD_MINIMA) {
    return {
      ...estado,
      mensaje: `${item.producto.nombre} ya está en la cantidad mínima. Usa «Quitar» para eliminarlo.`,
    };
  }

  const cantidad = item.cantidad - 1;

  return reemplazarCantidad(
    estado,
    productoId,
    cantidad,
    `${item.producto.nombre}: ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}.`,
  );
}

export function eliminarProducto(estado, productoId) {
  const item = buscarItem(estado, productoId);

  if (!item) return estado;

  return {
    items: estado.items.filter((otro) => otro.producto._id !== productoId),
    mensaje: `${item.producto.nombre} se quitó del carrito.`,
  };
}

/**
 * Refresca el carrito contra los productos recien traidos del catalogo.
 *
 * Al guardarse entre recargas, el carrito lleva dentro una foto del producto
 * de cuando se anadio. Si mientras tanto cambio el precio, desaparecio el
 * articulo o bajo el stock, esa foto miente. Esto la actualiza en cuanto
 * llegan datos frescos:
 *
 *   - lo que ya no esta en el catalogo se cae del carrito,
 *   - lo que sigue, adopta precio y stock actuales,
 *   - y la cantidad se recorta a lo que de verdad queda.
 *
 * Sin esto, persistir el carrito seria enseñar precios viejos en el resumen
 * de compra, que es peor que no persistirlo.
 */
export function sincronizarConCatalogo(estado, productos) {
  if (!Array.isArray(productos)) return estado;

  const porId = new Map(productos.map((producto) => [producto._id, producto]));

  const items = estado.items
    .filter((item) => porId.has(item.producto._id))
    .map((item) => {
      const fresco = porId.get(item.producto._id);
      return { producto: fresco, cantidad: Math.min(item.cantidad, fresco.stock) };
    })
    // Lo que se quedo sin stock no puede comprarse, asi que tampoco esperar.
    .filter((item) => item.cantidad >= CANTIDAD_MINIMA);

  const sinCambios = items.length === estado.items.length
    && items.every((item, i) => (
      item.producto === estado.items[i].producto && item.cantidad === estado.items[i].cantidad
    ));

  // Devolver el mismo objeto cuando no cambio nada evita un render de mas en
  // cada carga del catalogo.
  if (sinCambios) return estado;

  const desaparecidos = estado.items.length - items.length;

  return {
    items,
    mensaje: desaparecidos > 0
      ? (desaparecidos === 1
        ? 'Se quitó un producto del carrito porque ya no está disponible.'
        : `Se quitaron ${desaparecidos} productos del carrito porque ya no están disponibles.`)
      : estado.mensaje,
  };
}

// Se vacia al confirmar la compra (HU-33). Sin mensaje: la confirmacion ya
// ocupa toda la pantalla y anunciar ademas "se vacio el carrito" sobra.
export function vaciarCarrito() {
  return { items: [], mensaje: '' };
}

export function contarUnidades(items) {
  return items.reduce((total, item) => total + item.cantidad, 0);
}

export function calcularSubtotal({ producto, cantidad }) {
  return producto.precio * cantidad;
}

export function calcularTotal(items) {
  return items.reduce((total, item) => total + calcularSubtotal(item), 0);
}

export function carritoReducer(estado, accion) {
  switch (accion.type) {
    case 'producto/agregado':
      return agregarProductoAlCarrito(estado, accion.producto);
    case 'cantidad/aumentada':
      return aumentarCantidad(estado, accion.productoId);
    case 'cantidad/disminuida':
      return disminuirCantidad(estado, accion.productoId);
    case 'producto/eliminado':
      return eliminarProducto(estado, accion.productoId);
    case 'carrito/vaciado':
      return vaciarCarrito();
    case 'carrito/sincronizado':
      return sincronizarConCatalogo(estado, accion.productos);
    default:
      return estado;
  }
}
