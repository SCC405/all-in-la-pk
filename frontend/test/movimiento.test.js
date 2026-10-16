import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import * as sass from 'sass';

const rutaEstilos = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'styles');
const { css } = sass.compile(resolve(rutaEstilos, 'main.scss'));

// Recorta el bloque de prefers-reduced-motion para poder mirarlo aparte.
function bloqueMovimientoReducido(hoja) {
  const inicio = hoja.indexOf('@media (prefers-reduced-motion: reduce)');
  assert.notEqual(inicio, -1, 'falta el bloque de movimiento reducido');

  let profundidad = 0;
  for (let i = hoja.indexOf('{', inicio); i < hoja.length; i += 1) {
    if (hoja[i] === '{') profundidad += 1;
    if (hoja[i] === '}') {
      profundidad -= 1;
      if (profundidad === 0) return hoja.slice(inicio, i + 1);
    }
  }

  throw new Error('el bloque de movimiento reducido no cierra');
}

const reducido = bloqueMovimientoReducido(css);

// Sass emite CSS expandido. Comparar sin espacios evita que estas pruebas se
// rompan por un salto de linea de mas.
const compacto = css.replace(/\s+/g, '');
const reducidoCompacto = reducido.replace(/\s+/g, '');

test('los fotogramas compartidos se emiten una sola vez', () => {
  for (const nombre of ['aparecer', 'aparecer-subiendo', 'asentarse', 'latido', 'barrido']) {
    const veces = compacto.split(`@keyframes${nombre}{`).length - 1;
    assert.equal(veces, 1, `@keyframes ${nombre} aparece ${veces} veces`);
  }
});

test('toda animación con atajo declara fill-mode both', () => {
  // Es LA regla que no se puede perder. Con prefers-reduced-motion la duración
  // baja a 0,01 ms: si la animación no deja aplicado su estado final, lo que
  // entra desde opacity 0 se queda invisible para siempre. Un catálogo en
  // blanco es mucho peor que un desvanecido.
  const atajos = css.match(/animation:[^;}]+/g) ?? [];
  const sinBoth = atajos.filter((regla) => {
    if (/animation:\s*none/.test(regla)) return false;
    // El barrido del esqueleto es un bucle infinito que no deja estado final
    // que conservar, y se apaga aparte en el bloque de movimiento reducido.
    if (regla.includes('barrido')) return false;
    return !/\bboth\b/.test(regla);
  });

  assert.deepEqual(sinBoth, [], 'estas animaciones se quedarían a medias sin movimiento');
});

test('el escalonado del catálogo tiene tope', () => {
  const retardos = [...compacto.matchAll(/\.producto:nth-child\(\d+\)\{animation-delay:(\d+)ms;?\}/g)]
    .map((coincidencia) => Number(coincidencia[1]));

  assert.ok(retardos.length > 0, 'no se generó el escalonado');
  assert.ok(
    Math.max(...retardos) <= 600,
    `el último retardo es de ${Math.max(...retardos)}ms: demasiado para una rejilla larga`,
  );
});

test('el movimiento reducido apaga lo que no se apaga solo', () => {
  // Lo que se mueve con transform en reposo, no dentro de una animación: ahí
  // no hay duración que recortar, hay que anularlo a mano.
  for (const anulacion of [
    '.producto:hover',
    '.producto__imagen img',
    '.catalogo__titulo::after',
    '.carrito__contador--late',
    '.esqueleto',
  ]) {
    assert.ok(reducido.includes(anulacion), `falta anular ${anulacion}`);
  }
});

test('el barrido infinito del esqueleto se detiene sin movimiento', () => {
  // Un bucle que no para es justo lo que molesta a quien pide menos movimiento.
  assert.match(reducidoCompacto, /\.esqueleto\{[^}]*animation:none/);
});

test('las anulaciones de movimiento van después de lo que anulan', () => {
  // El orden en main.scss es lo único que las hace ganar: misma
  // especificidad, gana la última.
  assert.ok(
    css.indexOf('@media (prefers-reduced-motion: reduce)') > css.lastIndexOf('@keyframes'),
    'el bloque de movimiento reducido debe compilar después de los fotogramas',
  );
});

test('las reglas de accesibilidad siguen en pie', () => {
  // Las mismas que vigila scss.test.js, repetidas aquí a propósito: este
  // archivo es el que toca al añadir movimiento, y es donde se van a romper.
  assert.match(css, /\.visualmente-oculto/);
  assert.match(compacto, /outline:2pxsolid#d4af37/i);
  assert.match(css, /\.producto__stock--agotado/);
});

test('el panel del carrito transiciona tanto al abrir como al cerrar', () => {
  assert.match(
    compacto,
    /\.carrito__panel\{[^}]*opacity:0;[^}]*visibility:hidden;[^}]*transform:translateY\(-8px\);/,
  );
  assert.match(
    compacto,
    /\.carrito__panel--abierto\{[^}]*opacity:1;[^}]*visibility:visible;[^}]*transform:translateY\(0\);/,
  );
  assert.match(compacto, /transition:opacity280ms/);
});

test('el carrito se ancla a la cabecera en pantallas estrechas', () => {
  assert.match(
    compacto,
    /@media\(max-width:480px\)\{[^}]*\.cabecera\{position:relative;\}/,
  );
  assert.match(compacto, /\.carrito\{position:static;\}/);
  assert.match(
    compacto,
    /\.carrito__panel\{right:16px;left:16px;width:auto;[^}]*overflow-y:auto;/,
  );
});
