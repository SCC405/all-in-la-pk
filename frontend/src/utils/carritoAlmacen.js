// Guarda el carrito entre recargas.
//
// Vive en localStorage y no en el servidor porque no hay sesión de cliente: la
// tienda no pide registro para comprar. Es por navegador, igual que en
// cualquier tienda sin cuenta.
//
// Lo que se guarda son los productos tal y como estaban al añadirlos, así que
// envejece: un precio puede cambiar en el panel mientras el carrito duerme.
// Contra eso hay dos defensas, y hacen falta las dos:
//
//   1. Aquí, una caducidad: un carrito de hace días se descarta entero. Más
//      vale vacío que mintiendo.
//   2. En `sincronizarConCatalogo`, el refresco contra los datos frescos en
//      cuanto el catálogo responde.

export const CLAVE_CARRITO = 'all-in-la-pk:carrito';

// Sube si cambia la forma de lo guardado: lo viejo se descarta en vez de
// intentar migrarlo y acabar con un carrito a medias.
const VERSION = 1;

export const DURACION_CARRITO_MS = 24 * 60 * 60 * 1000;

function itemValido(item) {
  return Boolean(
    item
    && typeof item === 'object'
    && item.producto
    && typeof item.producto._id === 'string'
    && typeof item.producto.nombre === 'string'
    && Number.isFinite(item.producto.precio)
    && Number.isInteger(item.cantidad)
    && item.cantidad >= 1,
  );
}

/** Interpreta lo guardado. Devuelve los artículos utilizables, o `[]`. */
export function leerItemsGuardados(crudo, ahora = Date.now()) {
  if (typeof crudo !== 'string' || crudo === '') return [];

  let guardado;
  try {
    guardado = JSON.parse(crudo);
  } catch {
    // Alguien tocó la clave a mano, o quedó a medias. No es motivo para que la
    // tienda deje de funcionar.
    return [];
  }

  if (!guardado || guardado.version !== VERSION) return [];
  if (!Number.isFinite(guardado.guardadoEn)) return [];
  if (ahora - guardado.guardadoEn > DURACION_CARRITO_MS) return [];
  if (!Array.isArray(guardado.items)) return [];

  return guardado.items.filter(itemValido);
}

/** Serializa el carrito para guardarlo. */
export function serializarItems(items, ahora = Date.now()) {
  return JSON.stringify({ version: VERSION, guardadoEn: ahora, items });
}

// Las dos funciones de abajo tocan el navegador. Todo va en try/catch porque
// en navegación privada, con el almacenamiento bloqueado o en una cuota llena,
// `localStorage` lanza en vez de fallar en silencio.

export function cargarCarrito() {
  try {
    return leerItemsGuardados(window.localStorage.getItem(CLAVE_CARRITO));
  } catch {
    return [];
  }
}

export function guardarCarrito(items) {
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(CLAVE_CARRITO);
      return;
    }

    window.localStorage.setItem(CLAVE_CARRITO, serializarItems(items));
  } catch {
    // Que no se pueda guardar no debe romper la compra en curso: el carrito
    // sigue vivo en memoria, solo que no sobrevivirá a la recarga.
  }
}
