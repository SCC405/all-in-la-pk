import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer as crearServidorHttps, get as peticionHttps } from 'node:https';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import app from '../src/app.js';
import { opcionesHttps } from '../src/config/https.js';
import { crearForzarHttps, HSTS_MAX_AGE } from '../src/middlewares/forzar-https.js';

const raizBackend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLAVE = join(raizBackend, 'certs', 'localhost-key.pem');
const CERTIFICADO = join(raizBackend, 'certs', 'localhost-cert.pem');

// ---------- opcionesHttps ----------

test('sin certificados configurados no se activa HTTPS', () => {
  assert.equal(opcionesHttps({ httpsKeyPath: '', httpsCertPath: '' }), null);
});

test('configurar solo uno de los dos archivos es un error explícito', () => {
  assert.throws(
    () => opcionesHttps({ httpsKeyPath: '/ruta/clave.pem', httpsCertPath: '' }),
    /no solo uno de los dos/,
  );
});

test('una ruta inexistente da un mensaje que dice cómo arreglarlo', () => {
  assert.throws(
    () => opcionesHttps({ httpsKeyPath: '/no/existe.pem', httpsCertPath: '/no/existe.pem' }),
    /npm run certificados/,
  );
});

// ---------- middleware de redirección y HSTS ----------

function dobleDeRespuesta() {
  const registro = { estado: undefined, destino: undefined, cabeceras: {} };

  return {
    registro,
    redirect(estado, destino) {
      registro.estado = estado;
      registro.destino = destino;
    },
    setHeader(nombre, valor) {
      registro.cabeceras[nombre] = valor;
    },
  };
}

test('con forzarHttps desactivado no se toca la petición', () => {
  const response = dobleDeRespuesta();
  let siguiente = false;

  crearForzarHttps({ forzarHttps: false })({ secure: false }, response, () => {
    siguiente = true;
  });

  assert.ok(siguiente);
  assert.equal(response.registro.estado, undefined);
  assert.deepEqual(response.registro.cabeceras, {});
});

test('una petición insegura se redirige con 308, conservando método y ruta', () => {
  const response = dobleDeRespuesta();

  crearForzarHttps({ forzarHttps: true })(
    { secure: false, headers: { host: 'allinlapk.com' }, originalUrl: '/api/categorias?pagina=2' },
    response,
    () => assert.fail('no debería continuar: tiene que redirigir'),
  );

  // 308 y no 301: un POST redirigido con 301 se convertiría en GET y se
  // perderían los datos del formulario.
  assert.equal(response.registro.estado, 308);
  assert.equal(response.registro.destino, 'https://allinlapk.com/api/categorias?pagina=2');
});

test('la comprobación de salud no se redirige, aunque llegue sin cifrar', () => {
  const response = dobleDeRespuesta();
  let siguiente = false;

  // El proveedor de despliegue puede consultarla por dentro, sin pasar por el
  // proxy que añade X-Forwarded-Proto. Con un 308 la comprobación pasaría sin
  // haber tocado la aplicación: verificaría el redirector, no la API.
  crearForzarHttps({ forzarHttps: true })(
    { secure: false, path: '/api/health', headers: { host: 'x' }, originalUrl: '/api/health' },
    response,
    () => {
      siguiente = true;
    },
  );

  assert.ok(siguiente, 'debería dejar pasar la comprobación de salud');
  assert.equal(response.registro.estado, undefined, 'no debería redirigir');
});

test('la comprobación de salud sí recibe HSTS cuando llega cifrada', () => {
  const response = dobleDeRespuesta();
  let siguiente = false;

  // La exención se salta la redirección, no la cabecera. Sin esto /api/health
  // era la única ruta de la API que respondía sin HSTS, y HU-20 se quedaba sin
  // poder usarla como evidencia.
  crearForzarHttps({ forzarHttps: true })(
    { secure: true, path: '/api/health', headers: { host: 'x' }, originalUrl: '/api/health' },
    response,
    () => {
      siguiente = true;
    },
  );

  assert.ok(siguiente);
  assert.equal(response.registro.estado, undefined, 'no debería redirigir');
  assert.equal(
    response.registro.cabeceras['Strict-Transport-Security'],
    `max-age=${HSTS_MAX_AGE}; includeSubDomains`,
  );
});

test('sobre HTTPS se anuncia HSTS y se continúa', () => {
  const response = dobleDeRespuesta();
  let siguiente = false;

  crearForzarHttps({ forzarHttps: true })({ secure: true }, response, () => {
    siguiente = true;
  });

  assert.ok(siguiente);
  assert.equal(
    response.registro.cabeceras['Strict-Transport-Security'],
    `max-age=${HSTS_MAX_AGE}; includeSubDomains`,
  );
});

test('HSTS no se anuncia sobre una conexión sin cifrar', () => {
  const response = dobleDeRespuesta();

  crearForzarHttps({ forzarHttps: true })(
    { secure: false, headers: { host: 'x' }, originalUrl: '/' },
    response,
    () => {},
  );

  assert.equal(response.registro.cabeceras['Strict-Transport-Security'], undefined);
});

// ---------- servidor TLS real ----------

const hayCertificados = existsSync(CLAVE) && existsSync(CERTIFICADO);
const motivo = 'ejecuta "npm run certificados" para probar el servidor TLS real';

test('la API responde sobre una conexión cifrada', { skip: hayCertificados ? false : motivo }, async (context) => {
  const tls = opcionesHttps({ httpsKeyPath: CLAVE, httpsCertPath: CERTIFICADO });
  const servidor = crearServidorHttps(tls, app);

  await new Promise((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  context.after(() => new Promise((resolve) => servidor.close(resolve)));

  const { port } = servidor.address();

  const respuesta = await new Promise((resolve, reject) => {
    // rejectUnauthorized: false porque el certificado es autofirmado. El cifrado
    // es real; lo único que no hay es una autoridad que lo respalde.
    peticionHttps(
      { host: '127.0.0.1', port, path: '/api/health', rejectUnauthorized: false },
      (res) => {
        // El protocolo se lee aquí: para cuando salta 'end' el socket ya se
        // ha desacoplado de la respuesta y `res.socket` vale null.
        const protocolo = res.socket.getProtocol();
        let cuerpo = '';
        res.on('data', (trozo) => (cuerpo += trozo));
        res.on('end', () => resolve({ estado: res.statusCode, cuerpo, protocolo }));
      },
    ).on('error', reject);
  });

  assert.equal(respuesta.estado, 200);
  assert.equal(JSON.parse(respuesta.cuerpo).status, 'ok');

  // La prueba de que va cifrado: el socket negoció una versión de TLS.
  assert.match(respuesta.protocolo, /^TLSv1\.[23]$/);
});
