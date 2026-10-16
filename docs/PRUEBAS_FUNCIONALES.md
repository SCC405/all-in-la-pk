# Pruebas funcionales — HU-22

Registro de resultados de la HU-22 ([#21](https://github.com/SCC405/all-in-la-pk/issues/21)).
Ejecutado el 16 de octubre de 2026 sobre `develop` (`2ada3a0`), que es lo mismo que está
desplegado en Render.

## Resumen

| Ejecución | Resultado |
|---|---|
| Backend con MongoDB de pruebas (`MONGODB_URI_TEST`) | **135 pasan**, 0 fallan, 0 omitidas |
| Frontend | **136 pasan**, 0 fallan, 0 omitidas |
| Verificación de producción (`scripts/verificar-integracion.mjs`) | **14 de 14 OK** |
| Recorrido manual en producción | Catálogo, filtro, carrito y panel protegido, sin errores |

**271 pruebas automáticas aprobadas, ninguna omitida.** Sin base de pruebas, las tres suites
que tocan MongoDB se omiten y el backend se queda en 106 (105 en un clon sin certificados).
Las suites de integración, una vez conectadas, ejecutan cada caso como subprueba, y por eso el
total sube.

## Criterios de aceptación

### El CRUD de categorías es probado

`backend/test/categorias.routes.test.js`, contra MongoDB real: 14 casos.

- `POST` crea (201), rechaza un nombre vacío (400, con el campo) y uno repetido (409), e ignora
  campos que no le corresponden al cliente.
- `GET` lista ordenado por nombre, y devuelve una lista vacía cuando no hay datos.
- `PUT` actualiza (200), rechaza datos inválidos sin alterar el documento (400) y responde 404
  si no existe.
- `DELETE` elimina (204), **se niega a borrar una categoría con productos (409)** y la borra
  cuando se queda sin ellos.
- Un identificador mal formado da 400, nunca 500.

Además: `categoria.model.test.js` (10 validaciones del modelo) y
`categoria.persistencia.test.js` (la categoría creada queda almacenada).

### El CRUD de productos es probado

`backend/test/productos.routes.test.js`, contra MongoDB real: 12 casos.

- `POST` crea un producto asociado a su categoría (201), rechaza precio o stock inválidos
  campo por campo, rechaza una categoría inexistente e ignora campos reservados.
- `GET` lista con la categoría poblada; el `GET` individual devuelve el producto o 404.
- `PUT` actualiza y puede cambiar la categoría; si es inválido responde 400 sin alterar nada.
- `DELETE` elimina (204).
- Un identificador mal formado da 400.

Además: `producto.model.test.js` (13 validaciones del modelo).

### El catálogo es probado

- Producción: `GET /api/productos` devuelve 8 productos, todos con su categoría poblada
  (verificación de integración).
- Recorrido manual: la tienda muestra los 8 productos con precio y disponibilidad. El producto
  sin stock aparece como **Agotado** y su botón dice «Producto agotado» en lugar de «Agregar al
  carrito».
- `frontend/test/seguridadXss.test.js` (3): un texto con HTML se muestra como texto, ningún
  componente se salta el escape de React y las URL de imágenes solo admiten `http` y `https`.

### El filtrado es probado

- `frontend/test/filtrarProductos.test.js`, 4 casos: sin filtro devuelve todo; filtra por
  categoría poblada o por id; una categoría sin productos da lista vacía.
- Recorrido manual: al elegir **Fichas de póker** la tienda muestra «2 productos en Fichas de
  póker» y solo esos dos.

### El carrito es probado

- `carrito.test.js` (4), `carritoCantidades.test.js` (11), `carritoTotal.test.js` (6) y
  `carritoAlmacen.test.js` (17): agregar sin duplicar líneas, respetar el stock, subir y bajar
  cantidades sin llegar a cero, quitar, calcular subtotales y total, y conservar el carrito al
  recargar descartando lo caducado o lo que ya no está en el catálogo.
- `compra.test.js` (26) y `envio.test.js` (15): resumen de compra, datos de envío y forma de
  pago.
- Recorrido manual: dos barajas Bicycle ($18.000) y unas fichas de 14 g ($120.000) dan
  subtotales de **$36.000** y **$120.000** y un total de **$156.000**, que es lo correcto.

### El panel administrativo es probado

- `backend/test/sesion.integracion.test.js`, contra MongoDB real: 9 casos. Una contraseña
  incorrecta da 401 y no emite cookie; la cookie es `httpOnly`; cerrar sesión la invalida; crear
  categorías o productos sin sesión da 401, y el catálogo sigue siendo público.
- `backend/test/sesion.test.js` (23) y `csrf.test.js` (13): sesión firmada y token CSRF.
- `frontend/test/productosFormulario.test.js` (5), `validaciones.test.js` (15) y
  `sesion.test.js` (17): formularios del panel, mensajes de validación y flujo de inicio de
  sesión, incluido que no se obedezca un destino externo tras entrar.
- Recorrido manual: abrir `/admin` sin sesión redirige a `/login`.

## Cómo repetirlo

```bash
npm test --prefix backend
```

```bash
npm test --prefix frontend
```

```bash
node scripts/verificar-integracion.mjs
```

Para que el backend ejecute también las suites de MongoDB, se define `MONGODB_URI_TEST` con
una base que termine en `_test` (ver el README). En Windows, si falla con
`querySrv ECONNREFUSED`, el DNS de la red no resuelve los registros SRV de Atlas: se arregla
cambiando el DNS del equipo a `8.8.8.8` o `1.1.1.1`. No es un fallo de la aplicación; en
Render no ocurre.
