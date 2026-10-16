import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// scrypt viene en el módulo `crypto` de Node, así que no hace falta añadir una
// dependencia para esto. Está pensado a propósito para ser lento y costoso en
// memoria: quien robe el hash no puede probar millones de contraseñas por
// segundo, como sí haría contra un SHA-256 a secas.
const LONGITUD_SAL = 16;
const LONGITUD_CLAVE = 64;
const PREFIJO = 'scrypt';

/** Devuelve `scrypt$<sal>$<derivada>`, listo para guardar en una variable de entorno. */
export function generarHash(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('La contraseña no puede estar vacía.');
  }

  const sal = randomBytes(LONGITUD_SAL);
  const derivada = scryptSync(password, sal, LONGITUD_CLAVE);

  return `${PREFIJO}$${sal.toString('hex')}$${derivada.toString('hex')}`;
}

/**
 * Comprueba una contraseña contra el hash almacenado.
 *
 * La sal se guarda junto al hash: dos administradores con la misma contraseña
 * tendrían hashes distintos, y una tabla precalculada no sirve de nada.
 */
export function verificarPassword(password, almacenado) {
  if (typeof password !== 'string' || typeof almacenado !== 'string') return false;

  const partes = almacenado.split('$');
  if (partes.length !== 3 || partes[0] !== PREFIJO) return false;

  const sal = Buffer.from(partes[1], 'hex');
  const esperado = Buffer.from(partes[2], 'hex');

  // `Buffer.from(..., 'hex')` no falla con texto inválido: se detiene y
  // devuelve menos bytes. Comprobar la longitud es lo que descarta un hash
  // mal copiado, y ademas timingSafeEqual exige que midan lo mismo.
  if (sal.length !== LONGITUD_SAL || esperado.length !== LONGITUD_CLAVE) return false;

  const derivada = scryptSync(password, sal, LONGITUD_CLAVE);

  return timingSafeEqual(derivada, esperado);
}
