import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { normalizarUrlHttp } from '../src/utils/seguridad.js';

const RAIZ_SRC = fileURLToPath(new URL('../src/', import.meta.url));

async function archivosJavaScript(directorio) {
  const entradas = await readdir(directorio, { withFileTypes: true });
  const resultados = [];

  for (const entrada of entradas) {
    const ruta = `${directorio}/${entrada.name}`;
    if (entrada.isDirectory()) resultados.push(...(await archivosJavaScript(ruta)));
    if (entrada.isFile() && /\.jsx?$/.test(entrada.name)) resultados.push(ruta);
  }

  return resultados;
}

test('React muestra una entrada con HTML como texto y no crea elementos ejecutables', () => {
  const entrada = '<img src=x onerror=alert("xss")><script>alert("xss")</script>';
  const html = renderToStaticMarkup(
    createElement('p', { 'aria-label': entrada }, entrada),
  );

  assert.doesNotMatch(html, /<script>|<img\s/i);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img/);
});

test('el frontend no contiene puntos de inyección que omitan el escape de React', async () => {
  const patronesPeligrosos = [
    /dangerouslySetInnerHTML/,
    /\.innerHTML\s*=/,
    /\.outerHTML\s*=/,
    /insertAdjacentHTML\s*\(/,
    /document\.write\s*\(/,
    /\beval\s*\(/,
    /new\s+Function\s*\(/,
  ];

  for (const ruta of await archivosJavaScript(RAIZ_SRC)) {
    const contenido = await readFile(ruta, 'utf8');
    for (const patron of patronesPeligrosos) {
      assert.doesNotMatch(contenido, patron, `${ruta} contiene ${patron}`);
    }
  }
});

test('las URL de recursos solo admiten los protocolos http y https', () => {
  assert.equal(normalizarUrlHttp('https://ejemplo.com/fichas.webp'), 'https://ejemplo.com/fichas.webp');
  assert.equal(normalizarUrlHttp('http://ejemplo.com/baraja.png'), 'http://ejemplo.com/baraja.png');

  for (const valor of [
    'javascript:alert("xss")',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'file:///etc/passwd',
    '//ejemplo.com/sin-protocolo.webp',
    'no-es-una-url',
  ]) {
    assert.equal(normalizarUrlHttp(valor), '');
  }
});
