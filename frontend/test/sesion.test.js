import assert from 'node:assert/strict';
import test from 'node:test';
import {
  destinoSeguro,
  ESTADO_INICIAL_SESION,
  FASES,
  hayErroresDeCredenciales,
  mensajeDeFallo,
  sesionDesdeRespuesta,
  validarCredenciales,
} from '../src/utils/sesion.js';

// ---------- estado inicial ----------

test('al arrancar la sesión está en comprobación, no en inactiva', () => {
  // La diferencia importa: con «inactiva» el panel parpadearía y redirigiría
  // a /login antes de saber si la cookie sigue valiendo.
  assert.equal(ESTADO_INICIAL_SESION.fase, FASES.COMPROBANDO);
  assert.equal(ESTADO_INICIAL_SESION.usuario, null);
});

// ---------- lectura de la respuesta del servidor ----------

test('una sesión activa se refleja con su usuario', () => {
  assert.deepEqual(sesionDesdeRespuesta({ activa: true, usuario: 'admin' }), {
    fase: FASES.ACTIVA,
    usuario: 'admin',
  });
});

test('sin sesión activa se queda inactiva', () => {
  assert.deepEqual(sesionDesdeRespuesta({ activa: false }), {
    fase: FASES.INACTIVA,
    usuario: null,
  });
});

test('una respuesta ausente o rara se trata como falta de sesión', () => {
  // Ante la duda no se enseña el panel.
  for (const respuesta of [null, undefined, {}, 'cualquier cosa', { activa: 'si' }]) {
    const resultado = sesionDesdeRespuesta(respuesta);
    assert.equal(resultado.fase, FASES.INACTIVA, JSON.stringify(respuesta));
  }
});

// ---------- validación del formulario ----------

test('unas credenciales completas no producen errores', () => {
  assert.deepEqual(validarCredenciales({ usuario: 'admin', password: 'secreta' }), {});
});

test('el usuario vacío o en blanco es obligatorio', () => {
  for (const usuario of ['', '   ', undefined, null, 42]) {
    const errores = validarCredenciales({ usuario, password: 'secreta' });
    assert.equal(errores.usuario, 'El usuario es obligatorio.', JSON.stringify(usuario));
  }
});

test('la contraseña vacía es obligatoria', () => {
  const errores = validarCredenciales({ usuario: 'admin', password: '' });

  assert.equal(errores.password, 'La contraseña es obligatoria.');
});

test('una contraseña de solo espacios se acepta: podría ser la correcta', () => {
  // Recortarla aquí impediría entrar a quien la tenga así de verdad.
  assert.deepEqual(validarCredenciales({ usuario: 'admin', password: '   ' }), {});
});

test('los dos campos vacíos se señalan a la vez', () => {
  const errores = validarCredenciales({});

  assert.ok(errores.usuario);
  assert.ok(errores.password);
  assert.ok(hayErroresDeCredenciales(errores));
});

test('hayErroresDeCredenciales distingue el objeto vacío', () => {
  assert.equal(hayErroresDeCredenciales({}), false);
  assert.equal(hayErroresDeCredenciales(), false);
});

// ---------- mensajes de fallo ----------

test('el 401 conserva el mensaje del servidor, que no revela si el usuario existe', () => {
  const error = Object.assign(new Error('Credenciales incorrectas'), { estado: 401 });

  assert.equal(mensajeDeFallo(error), 'Credenciales incorrectas');
});

test('un fallo de red no se confunde con credenciales incorrectas', () => {
  // Decir «credenciales incorrectas» cuando el servidor no respondió sería
  // mentir, y mandaría al administrador a probar contraseñas para nada.
  const error = Object.assign(new Error('No se pudo conectar'), { estado: 0 });

  assert.match(mensajeDeFallo(error), /No se pudo conectar/);
});

test('cualquier otro error acaba con un mensaje legible', () => {
  assert.equal(mensajeDeFallo(undefined), 'No se pudo iniciar sesión.');
  assert.equal(mensajeDeFallo({ estado: 500, message: '' }), 'No se pudo iniciar sesión.');
});

// ---------- destino tras entrar ----------

test('tras entrar se vuelve a la página que se intentaba abrir', () => {
  assert.equal(destinoSeguro('/admin'), '/admin');
});

test('sin destino se va al panel', () => {
  for (const destino of [undefined, null, '', 0]) {
    assert.equal(destinoSeguro(destino), '/admin');
  }
});

test('un destino externo no se obedece', () => {
  // Si no, /login?destino=https://sitio-falso mandaría al administrador fuera
  // justo después de autenticarse.
  for (const destino of [
    'https://otro-sitio.com',
    'http://otro-sitio.com',
    '//otro-sitio.com',
    'javascript:alert(1)',
    'otro-sitio.com',
  ]) {
    assert.equal(destinoSeguro(destino), '/admin', destino);
  }
});

test('se puede cambiar el destino por defecto', () => {
  assert.equal(destinoSeguro(undefined, '/'), '/');
});
