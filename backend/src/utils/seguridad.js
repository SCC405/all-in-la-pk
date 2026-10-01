const PROTOCOLOS_HTTP = new Set(['http:', 'https:']);

/**
 * Acepta únicamente direcciones absolutas HTTP(S).
 *
 * Una URL escrita por un administrador termina en el atributo `src` de una
 * imagen del catálogo. Restringir el protocolo evita almacenar esquemas con
 * contenido activo, como `javascript:` o `data:`.
 */
export function esUrlHttpSegura(valor) {
  if (typeof valor !== 'string') return false;

  try {
    return PROTOCOLOS_HTTP.has(new URL(valor).protocol);
  } catch {
    return false;
  }
}
