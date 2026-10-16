import { calcularSubtotal, calcularTotal } from './carrito.js';
import { calcularTotales } from './envio.js';
import { etiquetaDePago } from './validacionesCompra.js';

// El pedido NO se guarda en ninguna parte (decisión de HU-33).
//
// Nada de esto llega al backend: no hay modelo `Pedido`, ni endpoint, ni
// colección. Lo que se arma aquí vive en memoria el tiempo que dura la pantalla
// de confirmación y se pierde al recargar. Por eso la confirmación dice que
// contactaremos al cliente para coordinar el pago y la entrega, y no que el
// pedido quedó registrado: sería mentira.
//
// Si algún día se decide persistirlo, el sitio por donde empezar es este
// archivo: `construirPedido` ya devuelve la forma que tendría el documento.

const ALFABETO = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Referencia del pedido, con la forma `APK-XXXXXX`.
 *
 * Se omiten I, O, Ñ y las vocales que se confunden al dictarla por teléfono.
 * No es un identificador único garantizado —no hay nada contra lo que
 * comprobarlo— sino una referencia legible para la conversación posterior.
 */
export function generarReferencia(aleatorio = Math.random) {
  let referencia = '';

  for (let i = 0; i < 6; i += 1) {
    referencia += ALFABETO[Math.floor(aleatorio() * ALFABETO.length)];
  }

  return `APK-${referencia}`;
}

/** Arma el pedido que se muestra en la confirmación. */
export function construirPedido({ items, datos, referencia = generarReferencia() }) {
  const totalProductos = calcularTotal(items);

  return {
    referencia,
    lineas: items.map(({ producto, cantidad }) => ({
      id: producto._id,
      nombre: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
      subtotal: calcularSubtotal({ producto, cantidad }),
    })),
    totales: calcularTotales(totalProductos),
    envio: {
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim(),
      telefono: datos.telefono.trim(),
      direccion: datos.direccion.trim(),
      ciudad: datos.ciudad.trim(),
    },
    pago: {
      valor: datos.pago,
      etiqueta: etiquetaDePago(datos.pago),
    },
  };
}
