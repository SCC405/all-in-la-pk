import assert from 'node:assert/strict';
import test from 'node:test';
import { carritoReducer, vaciarCarrito } from '../src/utils/carrito.js';
import { COSTO_ENVIO } from '../src/utils/envio.js';
import { construirPedido, generarReferencia } from '../src/utils/pedido.js';
import { primerCampoConError } from '../src/utils/validaciones.js';
import {
  compraCompleta,
  etiquetaDePago,
  FORMAS_DE_PAGO,
  LIMITES_COMPRA,
  ORDEN_CAMPOS_COMPRA,
  validarCompra,
} from '../src/utils/validacionesCompra.js';

const DATOS_VALIDOS = {
  nombre: 'Nicolay Baquero',
  correo: 'nicolay@correo.com',
  telefono: '3001234567',
  direccion: 'Calle 10 # 5-23',
  ciudad: 'Medellín',
  pago: 'contra-entrega',
};

const ITEMS = [
  { producto: { _id: 'p1', nombre: 'Baraja Copag', precio: 62000, stock: 7 }, cantidad: 2 },
  { producto: { _id: 'p2', nombre: 'Tapete verde', precio: 95000, stock: 4 }, cantidad: 1 },
];

// ---------- validación ----------

test('unos datos completos y bien escritos no producen errores', () => {
  assert.deepEqual(validarCompra(DATOS_VALIDOS), {});
});

test('todos los campos obligatorios se señalan a la vez', () => {
  const errores = validarCompra({});

  for (const campo of ORDEN_CAMPOS_COMPRA) {
    assert.ok(errores[campo], `falta el error de ${campo}`);
  }
});

test('un campo con solo espacios cuenta como vacío', () => {
  const errores = validarCompra({ ...DATOS_VALIDOS, direccion: '    ' });

  assert.equal(errores.direccion, 'La dirección es obligatoria.');
});

test('el correo tiene que parecer un correo', () => {
  for (const correo of ['sinarroba', 'sin@punto', '@dominio.com', 'con espacio@a.com']) {
    const errores = validarCompra({ ...DATOS_VALIDOS, correo });
    assert.ok(errores.correo, correo);
  }
});

test('un correo con subdominio o signo más se acepta', () => {
  // Son direcciones legítimas; rechazarlas sería un falso positivo.
  for (const correo of ['a@b.co', 'nombre+etiqueta@correo.com', 'x@mail.empresa.com.co']) {
    assert.equal(validarCompra({ ...DATOS_VALIDOS, correo }).correo, undefined, correo);
  }
});

test('el teléfono admite separadores e indicativo', () => {
  for (const telefono of ['3001234567', '300 123 4567', '+57 300 1234567', '(604) 444-5566']) {
    assert.equal(validarCompra({ ...DATOS_VALIDOS, telefono }).telefono, undefined, telefono);
  }
});

test('el teléfono rechaza lo que no son cifras suficientes', () => {
  for (const telefono of ['12345', 'no-es-un-telefono', '1234567890123456']) {
    assert.ok(validarCompra({ ...DATOS_VALIDOS, telefono }).telefono, telefono);
  }
});

test('se respetan los límites de longitud', () => {
  const errores = validarCompra({
    ...DATOS_VALIDOS,
    nombre: 'a'.repeat(LIMITES_COMPRA.nombre + 1),
    ciudad: 'c'.repeat(LIMITES_COMPRA.ciudad + 1),
  });

  assert.match(errores.nombre, /no puede superar/);
  assert.match(errores.ciudad, /no puede superar/);
});

test('una forma de pago inventada se rechaza', () => {
  const errores = validarCompra({ ...DATOS_VALIDOS, pago: 'criptomonedas' });

  assert.equal(errores.pago, 'Esa forma de pago no está disponible.');
});

test('las tres formas de pago declaradas se aceptan', () => {
  for (const { valor } of FORMAS_DE_PAGO) {
    assert.equal(validarCompra({ ...DATOS_VALIDOS, pago: valor }).pago, undefined, valor);
  }
});

test('ninguna forma de pago pide datos de tarjeta', () => {
  // El alcance dice explícitamente que no hay pasarela: si alguna opción
  // empezara a pedir número de tarjeta, esta prueba debería hacer ruido.
  const etiquetas = FORMAS_DE_PAGO.map(({ etiqueta }) => etiqueta.toLowerCase()).join(' ');

  for (const prohibido of ['cvv', 'número de tarjeta', 'vencimiento', 'titular']) {
    assert.equal(etiquetas.includes(prohibido), false, prohibido);
  }
});

test('el foco va al primer campo que falla, en el orden de la pantalla', () => {
  const errores = validarCompra({ ...DATOS_VALIDOS, correo: '', ciudad: '' });

  assert.equal(primerCampoConError(errores, ORDEN_CAMPOS_COMPRA), 'correo');
});

// ---------- botón de comprar ----------

test('con todos los campos escritos se puede comprar', () => {
  assert.equal(compraCompleta(DATOS_VALIDOS), true);
});

test('falta un campo y el botón no se habilita', () => {
  for (const campo of ORDEN_CAMPOS_COMPRA) {
    assert.equal(compraCompleta({ ...DATOS_VALIDOS, [campo]: '' }), false, campo);
  }
});

test('compraCompleta no juzga el formato, solo que haya algo', () => {
  // Es a propósito: el formato lo comprueba validarCompra al enviar, para que
  // el error se explique en vez de dejar el botón apagado sin motivo visible.
  assert.equal(compraCompleta({ ...DATOS_VALIDOS, correo: 'esto-no-es-un-correo' }), true);
});

// ---------- referencia del pedido ----------

test('la referencia tiene el prefijo y la longitud esperados', () => {
  assert.match(generarReferencia(), /^APK-[0-9A-Z]{6}$/);
});

test('la referencia evita los caracteres que se confunden al dictarla', () => {
  // Con un aleatorio fijo se recorre todo el alfabeto posible.
  const muchas = Array.from({ length: 200 }, () => generarReferencia()).join('');

  for (const confuso of ['I', 'O', 'Ñ']) {
    assert.equal(muchas.includes(confuso), false, confuso);
  }
});

test('dos referencias seguidas no son la misma', () => {
  assert.notEqual(generarReferencia(), generarReferencia());
});

// ---------- construcción del pedido ----------

test('el pedido recoge las líneas con su subtotal', () => {
  const pedido = construirPedido({ items: ITEMS, datos: DATOS_VALIDOS, referencia: 'APK-TEST01' });

  assert.equal(pedido.referencia, 'APK-TEST01');
  assert.deepEqual(
    pedido.lineas.map(({ nombre, cantidad, subtotal }) => ({ nombre, cantidad, subtotal })),
    [
      { nombre: 'Baraja Copag', cantidad: 2, subtotal: 124000 },
      { nombre: 'Tapete verde', cantidad: 1, subtotal: 95000 },
    ],
  );
});

test('el pedido aplica la regla de envío sobre el total de productos', () => {
  const pedido = construirPedido({ items: ITEMS, datos: DATOS_VALIDOS });

  // 124.000 + 95.000 = 219.000, por encima del umbral: envío gratis.
  assert.deepEqual(pedido.totales, { productos: 219000, envio: 0, total: 219000 });
});

test('un pedido pequeño paga el envío', () => {
  const unaBaraja = [ITEMS[0]].map((item) => ({ ...item, cantidad: 1 }));
  const pedido = construirPedido({ items: unaBaraja, datos: DATOS_VALIDOS });

  assert.deepEqual(pedido.totales, { productos: 62000, envio: COSTO_ENVIO, total: 62000 + COSTO_ENVIO });
});

test('los datos de envío se guardan recortados', () => {
  const pedido = construirPedido({
    items: ITEMS,
    datos: { ...DATOS_VALIDOS, nombre: '  Nicolay  ', ciudad: ' Medellín ' },
  });

  assert.equal(pedido.envio.nombre, 'Nicolay');
  assert.equal(pedido.envio.ciudad, 'Medellín');
});

test('el pedido guarda la etiqueta legible de la forma de pago', () => {
  const pedido = construirPedido({ items: ITEMS, datos: DATOS_VALIDOS });

  assert.equal(pedido.pago.valor, 'contra-entrega');
  assert.equal(pedido.pago.etiqueta, etiquetaDePago('contra-entrega'));
  assert.ok(pedido.pago.etiqueta);
});

test('el pedido no arrastra la contraseña ni nada que no se le haya pedido', () => {
  const pedido = construirPedido({
    items: ITEMS,
    datos: { ...DATOS_VALIDOS, password: 'no-deberia-estar', tarjeta: '4111111111111111' },
  });

  const serializado = JSON.stringify(pedido);

  assert.equal(serializado.includes('no-deberia-estar'), false);
  assert.equal(serializado.includes('4111111111111111'), false);
});

// ---------- vaciar el carrito ----------

test('vaciar el carrito lo deja sin artículos', () => {
  assert.deepEqual(vaciarCarrito(), { items: [], mensaje: '' });
});

test('el reducer entiende la acción de vaciar', () => {
  const lleno = { items: ITEMS, mensaje: 'algo' };

  assert.deepEqual(carritoReducer(lleno, { type: 'carrito/vaciado' }), {
    items: [],
    mensaje: '',
  });
});
