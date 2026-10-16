import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import * as sass from 'sass';

const raizFrontend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rutaEstilos = resolve(raizFrontend, 'src', 'styles');
const leer = (ruta) => readFileSync(resolve(raizFrontend, ruta), 'utf8');

test('la aplicación carga el punto de entrada SCSS', () => {
  const main = leer('src/main.jsx');

  assert.match(main, /import ['"]\.\/styles\/main\.scss['"]/);
  assert.doesNotMatch(main, /base\.css/);
});

test('main.scss ensambla los módulos de estilos', () => {
  const mainScss = leer('src/styles/main.scss');
  const modulos = [
    'base',
    'navbar',
    'buttons',
    'forms',
    'cards',
    'admin',
    'carrito',
    'accessibility',
  ];

  for (const modulo of modulos) {
    assert.match(mainScss, new RegExp(`@use ['"]${modulo}['"]`));
  }
});

test('los estilos usan variables, mixins y anidación de Sass', () => {
  const variables = leer('src/styles/_variables.scss');
  const mixins = leer('src/styles/_mixins.scss');
  const botones = leer('src/styles/_buttons.scss');

  assert.match(variables, /\$color-primary-text:\s*#3db273/i);
  assert.match(variables, /\$color-danger-text:\s*#e5534b/i);
  assert.match(mixins, /@mixin focus-ring/);
  assert.match(mixins, /@mixin respond-to/);
  assert.match(botones, /@include m\.interactive-control/);
  assert.match(botones, /&:hover:not\(:disabled\)/);
});

test('Sass compila y conserva las reglas de accesibilidad críticas', () => {
  const resultado = sass.compile(resolve(rutaEstilos, 'main.scss'));

  assert.match(resultado.css, /\.visualmente-oculto/);
  assert.match(resultado.css, /prefers-reduced-motion:\s*reduce/);
  assert.match(resultado.css, /:focus-visible/);
  assert.match(resultado.css, /\.producto__stock--agotado/);
  assert.match(resultado.css, /\.carrito__total/);
  assert.ok(
    resultado.css.lastIndexOf('transform: none') > resultado.css.indexOf('transform: translateY'),
    'la anulación de movimiento reducido debe compilar después de la transición de la tarjeta',
  );
});
