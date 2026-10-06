import assert from 'node:assert/strict';
import test from 'node:test';
import { generarHash, verificarPassword } from '../src/utils/password.js';
import {
  DURACION_MS,
  crearEstadoSesion,
  crearIniciarSesion,
  crearRequiereSesion,
  generarToken,
  leerToken,
} from '../src/middlewares/sesion.js';

const SECRETO = 'secreto-de-pruebas';
const PASSWORD = 'contrasena-larga';

const entornoConfigurado = {
  adminUsuario: 'admin',
  adminPasswordHash: generarHash(PASSWORD),
  sesionSecret: SECRETO,
  forzarHttps: false,
};

function dobleDeRespuesta() {
  const registro = { estado: undefined, cuerpo: undefined, cookies: {}, borradas: [] };

  const response = {
    registro,
    status(codigo) {
      registro.estado = codigo;
      return response;
    },
    json(cuerpo) {
      registro.cuerpo = cuerpo;
      return response;
    },
    end() {
      return response;
    },
    cookie(nombre, valor, opciones) {
      registro.cookies[nombre] = { valor, opciones };
      return response;
    },
    clearCookie(nombre) {
      registro.borradas.push(nombre);
      return response;
    },
  };

  return response;
}

// ---------- hash de contraseñas ----------

test('una contraseña se verifica contra su propio hash', () => {
  const hash = generarHash(PASSWORD);

  assert.ok(verificarPassword(PASSWORD, hash));
  assert.equal(verificarPassword('otra-cosa', hash), false);
});

test('la contraseña no aparece en el hash', () => {
  assert.equal(generarHash(PASSWORD).includes(PASSWORD), false);
});

test('dos hashes de la misma contraseña son distintos', () => {
  // Cada uno lleva su propia sal, así que una tabla precalculada no sirve.
  assert.notEqual(generarHash(PASSWORD), generarHash(PASSWORD));
});

test('un hash mal copiado se rechaza en vez de reventar', () => {
  for (const roto of ['', 'cualquier-cosa', 'scrypt$solo-dos$', 'scrypt$zz$zz', 'md5$aa$bb']) {
    assert.equal(verificarPassword(PASSWORD, roto), false, roto);
  }
});

test('generar un hash de contraseña vacía es un error explícito', () => {
  assert.throws(() => generarHash(''), /no puede estar vacía/);
});

// ---------- token de sesión ----------

test('un token recién emitido se puede leer', () => {
  const sesion = leerToken(generarToken('admin', SECRETO), SECRETO);

  assert.equal(sesion.usuario, 'admin');
});

test('un token firmado con otro secreto no vale', () => {
  assert.equal(leerToken(generarToken('admin', 'otro-secreto'), SECRETO), null);
});

test('un token manipulado no vale', () => {
  const token = generarToken('admin', SECRETO);
  const [usuario, caduca, firma] = token.split('.');

  // Cambiar el usuario conservando la firma: es el intento obvio.
  const otroUsuario = Buffer.from('intruso', 'utf8').toString('base64url');
  assert.equal(leerToken(`${otroUsuario}.${caduca}.${firma}`, SECRETO), null);

  // Estirar la caducidad tampoco cuela, porque va dentro de lo firmado.
  assert.equal(leerToken(`${usuario}.${Number(caduca) + DURACION_MS}.${firma}`, SECRETO), null);
});

test('un token caducado no vale', () => {
  const emitido = Date.now() - DURACION_MS - 1000;
  const token = generarToken('admin', SECRETO, emitido);

  assert.equal(leerToken(token, SECRETO), null);
});

test('un token con forma inesperada no vale', () => {
  for (const roto of [undefined, null, 123, '', 'a.b', 'a.b.c.d', '..']) {
    assert.equal(leerToken(roto, SECRETO), null, String(roto));
  }
});

test('un usuario con puntos en el nombre sobrevive al ida y vuelta', () => {
  // Va en base64url justamente para que no descoloque el despiece del token.
  const sesion = leerToken(generarToken('admin.de.pruebas', SECRETO), SECRETO);

  assert.equal(sesion.usuario, 'admin.de.pruebas');
});

// ---------- iniciar sesión ----------

test('con las credenciales correctas se abre la sesión y se emite la cookie', () => {
  const response = dobleDeRespuesta();

  crearIniciarSesion(entornoConfigurado)(
    { body: { usuario: 'admin', password: PASSWORD } },
    response,
  );

  assert.equal(response.registro.estado, 200);
  assert.equal(response.registro.cuerpo.usuario, 'admin');

  const cookie = response.registro.cookies.sesion;
  assert.ok(cookie, 'debería emitir la cookie de sesión');
  assert.equal(cookie.opciones.httpOnly, true, 'el frontend no debe poder leerla');
  assert.ok(leerToken(cookie.valor, SECRETO));
});

test('la cookie de sesión nunca lleva la contraseña', () => {
  const response = dobleDeRespuesta();

  crearIniciarSesion(entornoConfigurado)(
    { body: { usuario: 'admin', password: PASSWORD } },
    response,
  );

  assert.equal(response.registro.cookies.sesion.valor.includes(PASSWORD), false);
});

test('una contraseña incorrecta responde 401', () => {
  const response = dobleDeRespuesta();

  crearIniciarSesion(entornoConfigurado)(
    { body: { usuario: 'admin', password: 'no-es-esa' } },
    response,
  );

  assert.equal(response.registro.estado, 401);
  assert.equal(response.registro.cookies.sesion, undefined);
});

test('el mensaje de error no revela si el usuario existe', () => {
  const conUsuarioMalo = dobleDeRespuesta();
  const conPasswordMala = dobleDeRespuesta();

  crearIniciarSesion(entornoConfigurado)(
    { body: { usuario: 'no-existe', password: PASSWORD } },
    conUsuarioMalo,
  );
  crearIniciarSesion(entornoConfigurado)(
    { body: { usuario: 'admin', password: 'no-es-esa' } },
    conPasswordMala,
  );

  assert.deepEqual(conUsuarioMalo.registro.cuerpo, conPasswordMala.registro.cuerpo);
});

test('sin credenciales configuradas no entra nadie', () => {
  // Falla cerrado: una instalación a medio configurar no debe quedar abierta.
  const response = dobleDeRespuesta();

  crearIniciarSesion({ adminUsuario: '', adminPasswordHash: '', sesionSecret: SECRETO })(
    { body: { usuario: 'admin', password: PASSWORD } },
    response,
  );

  assert.equal(response.registro.estado, 401);
});

test('un cuerpo vacío no rompe el inicio de sesión', () => {
  const response = dobleDeRespuesta();

  crearIniciarSesion(entornoConfigurado)({}, response);

  assert.equal(response.registro.estado, 401);
});

// ---------- estado de la sesión ----------

test('el estado dice que no hay sesión cuando no hay cookie', () => {
  const response = dobleDeRespuesta();

  crearEstadoSesion(entornoConfigurado)({ cookies: {} }, response);

  assert.deepEqual(response.registro.cuerpo, { activa: false });
});

test('el estado reconoce una sesión abierta', () => {
  const response = dobleDeRespuesta();

  crearEstadoSesion(entornoConfigurado)(
    { cookies: { sesion: generarToken('admin', SECRETO) } },
    response,
  );

  assert.deepEqual(response.registro.cuerpo, { activa: true, usuario: 'admin' });
});

// ---------- middleware que exige sesión ----------

test('leer el catálogo no exige sesión', () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS']) {
    let siguiente = false;

    crearRequiereSesion(entornoConfigurado)({ method, cookies: {} }, dobleDeRespuesta(), () => {
      siguiente = true;
    });

    assert.ok(siguiente, `${method} debería pasar sin sesión`);
  }
});

test('modificar datos sin sesión responde 401', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    const response = dobleDeRespuesta();

    crearRequiereSesion(entornoConfigurado)({ method, cookies: {} }, response, () =>
      assert.fail(`${method} no debería pasar sin sesión`),
    );

    assert.equal(response.registro.estado, 401, method);
  }
});

test('modificar datos con sesión válida pasa, y deja la sesión en la petición', () => {
  const request = { method: 'POST', cookies: { sesion: generarToken('admin', SECRETO) } };
  let siguiente = false;

  crearRequiereSesion(entornoConfigurado)(request, dobleDeRespuesta(), () => {
    siguiente = true;
  });

  assert.ok(siguiente);
  assert.equal(request.sesion.usuario, 'admin');
});

test('una cookie de sesión falsificada no abre la puerta', () => {
  const response = dobleDeRespuesta();
  const falso = generarToken('admin', 'secreto-inventado');

  crearRequiereSesion(entornoConfigurado)(
    { method: 'DELETE', cookies: { sesion: falso } },
    response,
    () => assert.fail('no debería dejar pasar un token firmado con otro secreto'),
  );

  assert.equal(response.registro.estado, 401);
});
