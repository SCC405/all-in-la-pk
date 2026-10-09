import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calcularEnvio,
  calcularTotales,
  COSTO_ENVIO,
  ENVIO_GRATIS_DESDE,
  faltaParaEnvioGratis,
} from '../src/utils/envio.js';

// ---------- costo del envío ----------

test('una compra por debajo del umbral paga la tarifa plana', () => {
  assert.equal(calcularEnvio(18000), COSTO_ENVIO);
  assert.equal(calcularEnvio(ENVIO_GRATIS_DESDE - 1), COSTO_ENVIO);
});

test('justo en el umbral el envío ya es gratis', () => {
  // El límite es inclusivo: quien llega exactamente a la cifra no paga.
  assert.equal(calcularEnvio(ENVIO_GRATIS_DESDE), 0);
});

test('por encima del umbral el envío es gratis', () => {
  assert.equal(calcularEnvio(320000), 0);
});

test('un carrito vacío no paga envío', () => {
  // No hay nada que enviar, así que cobrarlo sería absurdo.
  assert.equal(calcularEnvio(0), 0);
});

test('un total imposible no rompe el cálculo', () => {
  for (const malo of [undefined, null, NaN, Infinity, 'mucho']) {
    assert.equal(calcularEnvio(malo), COSTO_ENVIO, String(malo));
  }
});

test('un total negativo se trata como carrito vacío', () => {
  assert.equal(calcularEnvio(-5000), 0);
});

// ---------- cuánto falta para el envío gratis ----------

test('dice cuánto falta para el envío gratis', () => {
  assert.equal(faltaParaEnvioGratis(150000), ENVIO_GRATIS_DESDE - 150000);
});

test('no falta nada si ya se alcanzó el umbral', () => {
  assert.equal(faltaParaEnvioGratis(ENVIO_GRATIS_DESDE), 0);
  assert.equal(faltaParaEnvioGratis(500000), 0);
});

test('con el carrito vacío no se ofrece el aviso', () => {
  // Decir «te faltan 200.000 para el envío gratis» sin nada en el carrito
  // sería ruido, no ayuda.
  assert.equal(faltaParaEnvioGratis(0), 0);
});

// ---------- desglose ----------

test('el desglose suma productos más envío', () => {
  assert.deepEqual(calcularTotales(100000), {
    productos: 100000,
    envio: COSTO_ENVIO,
    total: 100000 + COSTO_ENVIO,
  });
});

test('con envío gratis el total es solo el de los productos', () => {
  assert.deepEqual(calcularTotales(250000), {
    productos: 250000,
    envio: 0,
    total: 250000,
  });
});

test('el desglose de un carrito vacío es todo a cero', () => {
  assert.deepEqual(calcularTotales(0), { productos: 0, envio: 0, total: 0 });
});

test('el desglose nunca devuelve un total negativo', () => {
  assert.deepEqual(calcularTotales(-1000), { productos: 0, envio: 0, total: 0 });
});

// ---------- coherencia de la regla ----------

test('el umbral está por encima de la tarifa, que es lo que la hace un incentivo', () => {
  // Si el envío gratis costara menos que el propio envío, nadie compraría más
  // para ahorrárselo.
  assert.ok(ENVIO_GRATIS_DESDE > COSTO_ENVIO);
});

test('faltaParaEnvioGratis y calcularEnvio cuentan la misma historia', () => {
  for (const total of [0, 1, 18000, 128125, 199999, 200000, 320000]) {
    const gratis = calcularEnvio(total) === 0;
    const yaNoFalta = faltaParaEnvioGratis(total) === 0;

    assert.equal(gratis, yaNoFalta, `incoherencia con un total de ${total}`);
  }
});
