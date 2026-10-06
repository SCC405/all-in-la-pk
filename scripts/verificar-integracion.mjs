#!/usr/bin/env node

const WEB_URL = (process.env.WEB_URL ?? 'https://all-in-la-pk-web.onrender.com').replace(/\/$/, '');
const API_ORIGIN = (process.env.API_ORIGIN ?? 'https://all-in-la-pk-api.onrender.com').replace(
  /\/$/,
  '',
);
const API_URL = `${API_ORIGIN}/api`;

const resultados = [];

function comprobar(condicion, nombre, detalle) {
  resultados.push({ estado: condicion ? 'OK' : 'FALLO', nombre, detalle });
  if (!condicion) process.exitCode = 1;
}

async function obtener(url, opciones) {
  const respuesta = await fetch(url, { redirect: 'follow', ...opciones });
  comprobar(respuesta.ok, `GET ${new URL(url).pathname}`, `HTTP ${respuesta.status}`);
  return respuesta;
}

try {
  const web = await obtener(WEB_URL);
  const html = await web.text();
  comprobar(
    html.includes('id="root"') && /assets\/index-[^"']+\.js/.test(html),
    'Frontend compilado',
    'El documento contiene el punto de montaje y el bundle de Vite.',
  );

  const health = await obtener(`${API_URL}/health`, { headers: { Origin: WEB_URL } });
  const healthBody = await health.json();
  comprobar(
    healthBody.status === 'ok' && healthBody.environment === 'production',
    'Backend en producción',
    `${healthBody.service} · ${healthBody.environment}`,
  );
  comprobar(
    health.headers.get('access-control-allow-origin') === WEB_URL,
    'CORS del frontend',
    health.headers.get('access-control-allow-origin') ?? 'Cabecera ausente',
  );

  const origenAjeno = 'https://origen-no-autorizado.example';
  const corsAjeno = await fetch(`${API_URL}/health`, { headers: { Origin: origenAjeno } });
  comprobar(
    corsAjeno.headers.get('access-control-allow-origin') !== origenAjeno,
    'CORS rechaza otros orígenes',
    corsAjeno.headers.get('access-control-allow-origin') ?? 'Sin autorización CORS',
  );

  const categoriasRespuesta = await obtener(`${API_URL}/categorias`);
  const categorias = await categoriasRespuesta.json();
  comprobar(
    Array.isArray(categorias) && categorias.length > 0,
    'Categorías reales',
    `${categorias.length} registros`,
  );

  const productosRespuesta = await obtener(`${API_URL}/productos`);
  const productos = await productosRespuesta.json();
  comprobar(
    Array.isArray(productos) && productos.length > 0,
    'Productos reales',
    `${productos.length} registros`,
  );
  comprobar(
    productos.every((producto) => producto.categoria?._id && producto.categoria?.nombre),
    'Relaciones producto-categoría',
    'Todos los productos incluyen una categoría poblada.',
  );
  comprobar(
    productosRespuesta.headers.get('strict-transport-security')?.includes('max-age=31536000'),
    'HSTS de la API',
    productosRespuesta.headers.get('strict-transport-security') ?? 'Cabecera ausente',
  );

  const swagger = await obtener(`${API_ORIGIN}/api-docs.json`);
  const especificacion = await swagger.json();
  const rutasEsperadas = ['/health', '/csrf-token', '/categorias', '/productos'];
  comprobar(
    rutasEsperadas.every((ruta) => especificacion.paths?.[ruta]),
    'Contrato Swagger',
    `${Object.keys(especificacion.paths ?? {}).length} rutas documentadas`,
  );
} catch (error) {
  comprobar(false, 'Ejecución', error instanceof Error ? error.message : String(error));
}

console.table(resultados);

if (process.exitCode) {
  console.error('\nLa integración tiene comprobaciones fallidas.');
} else {
  console.log('\nIntegración de producción verificada correctamente.');
}

