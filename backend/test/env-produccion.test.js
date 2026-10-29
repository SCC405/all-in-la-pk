import assert from 'node:assert/strict';
import test from 'node:test';
import { validarConfiguracionProduccion } from '../src/config/env.js';

const configuracion = {
  nodeEnv: 'production',
  mongodbUri: 'mongodb://localhost:27017/solo-prueba',
  csrfSecret: 'secreto-csrf-de-prueba',
  adminUsuario: 'admin',
  adminPasswordHash: 'hash-de-prueba',
  sesionSecret: 'secreto-sesion-de-prueba',
};

test('producción rechaza secretos faltantes sin mostrar sus valores', () => {
  const incompleta = { ...configuracion, sesionSecret: '', csrfSecret: '' };

  assert.throws(
    () => validarConfiguracionProduccion(incompleta, { CORS_ORIGIN: 'https://tienda.ejemplo' }),
    (error) => error.message.includes('CSRF_SECRET')
      && error.message.includes('SESION_SECRET')
      && !error.message.includes('secreto-csrf-de-prueba'),
  );
});

test('producción exige un origen CORS configurado de forma explícita', () => {
  assert.throws(
    () => validarConfiguracionProduccion(configuracion, {}),
    /CORS_ORIGIN/,
  );
});

test('una configuración completa pasa y desarrollo conserva el arranque local', () => {
  assert.doesNotThrow(() => validarConfiguracionProduccion(
    configuracion,
    { CORS_ORIGIN: 'https://tienda.ejemplo' },
  ));
  assert.doesNotThrow(() => validarConfiguracionProduccion({ nodeEnv: 'development' }, {}));
});
