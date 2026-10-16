// Regla del costo de envío. Vive SOLO aquí: ni la página de compra ni la de
// confirmación calculan nada por su cuenta, para que cambiar la política sea
// tocar este archivo y nada más.
//
// Por qué una tarifa plana y no una por ciudad o por peso:
//
//   El catálogo no guarda peso ni volumen de los productos, y tampoco hay una
//   lista de ciudades con sus tarifas. Cualquier cálculo por destino serían
//   números inventados que además habría que mantener. Una tarifa plana es
//   honesta, se explica en una frase y no miente sobre datos que no tenemos.
//
// Por qué 200.000 como umbral de envío gratis:
//
//   Los ocho productos del catálogo van de 18.000 a 320.000, con una media de
//   128.125. Solo uno pasa de 200.000 por sí solo, pero dos artículos medios
//   suman 256.250. El umbral queda donde hace de incentivo real —casi nadie lo
//   alcanza con una sola compra pequeña, casi todos con dos— en vez de ser
//   inalcanzable o regalado.

/** Tarifa plana de envío, en pesos colombianos. */
export const COSTO_ENVIO = 12000;

/** A partir de este total en productos, el envío no se cobra. */
export const ENVIO_GRATIS_DESDE = 200000;

/** Devuelve lo que cuesta el envío para un total de productos dado. */
export function calcularEnvio(totalProductos) {
  if (typeof totalProductos !== 'number' || !Number.isFinite(totalProductos)) return COSTO_ENVIO;

  // Un carrito vacío no paga envío: no hay nada que enviar.
  if (totalProductos <= 0) return 0;

  return totalProductos >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
}

/** Cuánto falta para que el envío salga gratis, o 0 si ya lo es. */
export function faltaParaEnvioGratis(totalProductos) {
  if (typeof totalProductos !== 'number' || !Number.isFinite(totalProductos)) return 0;
  if (totalProductos <= 0 || totalProductos >= ENVIO_GRATIS_DESDE) return 0;

  return ENVIO_GRATIS_DESDE - totalProductos;
}

/** Desglose completo: productos, envío y total a pagar. */
export function calcularTotales(totalProductos) {
  const productos = typeof totalProductos === 'number' && Number.isFinite(totalProductos)
    ? Math.max(totalProductos, 0)
    : 0;
  const envio = calcularEnvio(productos);

  return { productos, envio, total: productos + envio };
}
