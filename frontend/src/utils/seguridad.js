const PROTOCOLOS_HTTP = new Set(['http:', 'https:']);

/**
 * Devuelve una URL absoluta HTTP(S) o una cadena vacía cuando el valor no se
 * puede usar con seguridad como recurso remoto.
 *
 * El backend aplica la misma regla al guardar. Esta segunda barrera protege el
 * catálogo si existen datos antiguos o una API ajena entrega contenido no
 * validado.
 */
export function normalizarUrlHttp(valor) {
  if (typeof valor !== 'string') return '';

  try {
    const url = new URL(valor);
    return PROTOCOLOS_HTTP.has(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}
