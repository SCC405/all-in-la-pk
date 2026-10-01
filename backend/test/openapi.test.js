import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../src/app.js';
import categoriasRouter from '../src/routes/categorias.routes.js';
import csrfRouter from '../src/routes/csrf.routes.js';
import healthRouter from '../src/routes/health.routes.js';
import productosRouter from '../src/routes/productos.routes.js';
import openapi from '../src/docs/openapi.js';

async function servidorDePrueba(contexto) {
  const servidor = await new Promise((resolve, reject) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
    s.on('error', reject);
  });

  contexto.after(() => new Promise((resolve) => servidor.close(resolve)));

  return `http://127.0.0.1:${servidor.address().port}`;
}

// Traduce la tabla de rutas real de Express al formato de rutas de OpenAPI:
//   router '/'    montado en '/categorias'  ->  '/categorias'
//   router '/:id' montado en '/productos'   ->  '/productos/{id}'
function rutasReales() {
  const montajes = [
    ['', healthRouter],
    ['', csrfRouter],
    ['/categorias', categoriasRouter],
    ['/productos', productosRouter],
  ];

  return montajes.flatMap(([prefijo, router]) =>
    router.stack
      .filter((capa) => capa.route)
      .flatMap((capa) => {
        const sufijo = capa.route.path === '/' ? '' : capa.route.path.replace(/:(\w+)/g, '{$1}');
        return Object.keys(capa.route.methods).map((metodo) => `${metodo.toUpperCase()} ${prefijo}${sufijo}`);
      }),
  );
}

function rutasDocumentadas() {
  return Object.entries(openapi.paths).flatMap(([ruta, operaciones]) =>
    Object.keys(operaciones).map((metodo) => `${metodo.toUpperCase()} ${ruta}`),
  );
}

test('la documentación cubre exactamente los endpoints que existen', () => {
  const reales = rutasReales().sort();
  const documentadas = rutasDocumentadas().sort();

  const sinDocumentar = reales.filter((r) => !documentadas.includes(r));
  const documentadasDeMas = documentadas.filter((r) => !reales.includes(r));

  assert.deepEqual(sinDocumentar, [], 'hay endpoints sin documentar en Swagger');
  assert.deepEqual(documentadasDeMas, [], 'Swagger documenta endpoints que ya no existen');
});

test('Swagger distingue los cuerpos obligatorios de creación y las actualizaciones parciales', () => {
  const referenciaCuerpo = (ruta, metodo) =>
    openapi.paths[ruta][metodo].requestBody.content['application/json'].schema.$ref;

  assert.equal(referenciaCuerpo('/categorias', 'post'), '#/components/schemas/CategoriaCreacion');
  assert.equal(
    referenciaCuerpo('/categorias/{id}', 'put'),
    '#/components/schemas/CategoriaActualizacion',
  );
  assert.equal(referenciaCuerpo('/productos', 'post'), '#/components/schemas/ProductoCreacion');
  assert.equal(
    referenciaCuerpo('/productos/{id}', 'put'),
    '#/components/schemas/ProductoActualizacion',
  );

  const requeridosCategoria = openapi.components.schemas.CategoriaCreacion.allOf[1].required;
  const requeridosProducto = openapi.components.schemas.ProductoCreacion.allOf[1].required;

  assert.deepEqual(requeridosCategoria, ['nombre']);
  assert.deepEqual(requeridosProducto, ['nombre', 'precio', 'stock', 'imagen', 'categoria']);
  assert.equal(openapi.components.schemas.CategoriaActualizacion.required, undefined);
  assert.equal(openapi.components.schemas.ProductoActualizacion.required, undefined);
});

test('Swagger documenta que las imágenes solo admiten URL HTTP o HTTPS', () => {
  for (const esquema of ['Producto', 'ProductoCampos']) {
    const imagen = openapi.components.schemas[esquema].properties.imagen;
    assert.equal(imagen.format, 'uri');
    assert.equal(imagen.pattern, '^https?://');
  }
});

test('cada operación declara resumen, etiqueta y respuestas', () => {
  for (const [ruta, operaciones] of Object.entries(openapi.paths)) {
    for (const [metodo, operacion] of Object.entries(operaciones)) {
      const donde = `${metodo.toUpperCase()} ${ruta}`;

      assert.ok(operacion.summary, `${donde} no tiene summary`);
      assert.ok(operacion.tags?.length, `${donde} no tiene tags`);
      assert.ok(Object.keys(operacion.responses ?? {}).length, `${donde} no declara respuestas`);
    }
  }
});

test('toda referencia $ref apunta a un esquema que existe', () => {
  const definidos = new Set(Object.keys(openapi.components.schemas));
  const usados = new Set();

  (function recorrer(nodo) {
    if (Array.isArray(nodo)) return nodo.forEach(recorrer);
    if (nodo && typeof nodo === 'object') {
      for (const [clave, valor] of Object.entries(nodo)) {
        if (clave === '$ref' && typeof valor === 'string') usados.add(valor.split('/').pop());
        else recorrer(valor);
      }
    }
  })(openapi.paths);

  const rotas = [...usados].filter((nombre) => !definidos.has(nombre));
  assert.deepEqual(rotas, [], 'hay $ref que apuntan a esquemas inexistentes');
});

test('GET /api-docs.json devuelve la especificación', async (context) => {
  const base = await servidorDePrueba(context);

  const respuesta = await fetch(`${base}/api-docs.json`);
  const cuerpo = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.equal(cuerpo.openapi, '3.0.3');
  assert.equal(cuerpo.info.title, 'All In La PK — API REST');
  assert.ok(cuerpo.paths['/categorias']);
  assert.ok(cuerpo.paths['/productos']);
});

test('GET /api-docs sirve la interfaz de Swagger UI', async (context) => {
  const base = await servidorDePrueba(context);

  const respuesta = await fetch(`${base}/api-docs/`);
  const html = await respuesta.text();

  assert.equal(respuesta.status, 200);
  assert.match(respuesta.headers.get('content-type'), /text\/html/);
  assert.match(html, /swagger-ui/);
});
