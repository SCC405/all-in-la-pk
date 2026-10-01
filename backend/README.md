# Backend — All In La PK

API REST construida con **Node.js + Express + Mongoose**, conectada a **MongoDB Atlas**.
No renderiza vistas: únicamente recibe solicitudes, procesa la lógica y devuelve JSON (RNF-03).

## Estado

Backend implementado hasta **HU-05 — CRUD REST de productos**.

- Servidor Express con respuestas JSON.
- Configuración mediante variables de entorno.
- Conexión a MongoDB mediante Mongoose.
- Manejo controlado de errores de configuración y conexión.
- Endpoint de salud en `GET /api/health`.
- CRUD REST de categorías y productos.
- Pruebas automáticas con el módulo de pruebas de Node.js.

## Estructura prevista

```
backend/
├── src/
│   ├── config/          # Conexión a MongoDB, variables de entorno
│   ├── models/          # Esquemas de Mongoose (Categoria, Producto)
│   ├── controllers/     # Lógica de cada endpoint
│   ├── routes/          # Definición de rutas REST
│   ├── middlewares/     # Validaciones, seguridad (XSS, CSRF), manejo de errores
│   ├── docs/            # Configuración de Swagger/OpenAPI
│   └── app.js
├── .env.example
├── package.json
├── test/
└── server.js
```

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

Antes de iniciar, completa `MONGODB_URI` en `.env`. El servidor solo comienza a escuchar solicitudes después de establecer correctamente la conexión con MongoDB.

Comandos disponibles:

```bash
npm run dev     # desarrollo con recarga automática
npm start       # ejecución normal
npm test        # pruebas automáticas
npm run check   # validación de sintaxis
```

## Endpoints

```
GET    /api/categorias
POST   /api/categorias
PUT    /api/categorias/:id
DELETE /api/categorias/:id

GET    /api/productos
GET    /api/productos/:id
POST   /api/productos
PUT    /api/productos/:id
DELETE /api/productos/:id
```

## Documentación de la API (HU-06)

Con el backend corriendo:

| Dirección | Qué es |
|---|---|
| `http://localhost:4000/api-docs` | Swagger UI: la API navegable, con botón **Try it out** para ejecutar cada operación |
| `http://localhost:4000/api-docs.json` | La especificación OpenAPI cruda, importable en Postman o Insomnia |

La especificación vive en un único archivo, [`src/docs/openapi.js`](src/docs/openapi.js), en vez
de repartida en comentarios por las rutas: así se lee el contrato completo de un vistazo, que es
lo que pide RNF-05.

Hay una prueba que **compara las tablas de rutas de salud, categorías y productos con lo
documentado** y falla si alguien agrega, cambia o elimina una operación en esos routers sin
actualizar Swagger. También comprueba que Swagger distinga los cuerpos obligatorios de creación
de las actualizaciones parciales.

### Categorías (implementado en HU-03)

| Método | Ruta | Respuesta correcta | Errores |
|---|---|---|---|
| `GET` | `/api/categorias` | `200` con la lista ordenada por nombre | — |
| `POST` | `/api/categorias` | `201` con la categoría creada | `400` datos no válidos · `409` nombre repetido |
| `PUT` | `/api/categorias/:id` | `200` con la categoría actualizada | `400` datos o id no válidos · `404` no existe · `409` nombre repetido |
| `DELETE` | `/api/categorias/:id` | `204` sin cuerpo | `400` id no válido · `404` no existe · `409` tiene productos asociados |

Solo se aceptan `nombre` y `descripcion` del cuerpo de la petición; cualquier otro campo se
ignora, de modo que un cliente no puede intentar fijar el `_id` ni las marcas de tiempo.

Una categoría **no puede eliminarse mientras tenga productos asociados**: la API responde `409`
indicando cuántos son. Si se permitiera, esos productos quedarían apuntando a una categoría
inexistente, `populate` devolvería `null` y el catálogo mostraría productos sin categoría que
además no aparecerían en ningún filtro.

Forma de las respuestas de error:

```json
{ "error": "Datos no válidos",
  "detalles": { "nombre": "El nombre de la categoría es obligatorio." } }
```

`detalles` solo aparece cuando falla la validación del esquema, con un mensaje por campo
para que el formulario del panel administrativo pueda señalar exactamente qué corregir.

### Productos (implementado en HU-05)

| Método | Ruta | Respuesta correcta | Errores |
|---|---|---|---|
| `GET` | `/api/productos` | `200` con la lista ordenada por nombre | — |
| `GET` | `/api/productos/:id` | `200` con el producto | `400` id no válido · `404` no existe |
| `POST` | `/api/productos` | `201` con el producto creado | `400` datos o categoría no válidos |
| `PUT` | `/api/productos/:id` | `200` con el producto actualizado | `400` datos, id o categoría no válidos · `404` no existe |
| `DELETE` | `/api/productos/:id` | `204` sin cuerpo | `400` id no válido · `404` no existe |

Los productos se devuelven con su categoría asociada mediante `populate`. Solo se aceptan
`nombre`, `descripcion`, `precio`, `stock`, `imagen` y `categoria`; los campos reservados
como `_id` y las marcas de tiempo se ignoran.

El endpoint `GET /api/health` está disponible como comprobación básica del backend.

## Modelos

```
Categoria                 Producto
- _id                     - _id
- nombre (obligatorio)    - nombre
- descripcion             - descripcion
                          - precio  (>= 0)
                          - stock   (>= 0, entero)
                          - imagen
                          - categoria → ref Categoria
```

### Categoria (implementado en HU-02)

`src/models/categoria.model.js`

| Campo | Tipo | Reglas |
|---|---|---|
| `_id` | ObjectId | Identificador único, generado por MongoDB |
| `nombre` | String | **Obligatorio**, único, sin espacios sobrantes, máximo 60 caracteres |
| `descripcion` | String | Opcional, por defecto `''`, máximo 300 caracteres |
| `createdAt` / `updatedAt` | Date | Automáticos (`timestamps`) |

El nombre es único para que el catálogo no quede ambiguo: dos categorías llamadas igual
harían imposible saber cuál está filtrando el visitante. Un intento de duplicado hace que
MongoDB devuelva el error `11000`, que el CRUD traduce a una respuesta HTTP en HU-03.

### Producto (implementado en HU-04)

`src/models/producto.model.js`

| Campo | Tipo | Reglas |
|---|---|---|
| `_id` | ObjectId | Identificador único, generado por MongoDB |
| `nombre` | String | **Obligatorio**, sin espacios sobrantes, máximo 100 caracteres |
| `descripcion` | String | Opcional, por defecto `''`, máximo 1000 caracteres |
| `precio` | Number | **Obligatorio**, finito y mayor o igual que cero |
| `stock` | Number | **Obligatorio**, entero y mayor o igual que cero |
| `imagen` | String | **Obligatoria**, URL absoluta HTTP(S), máximo 2048 caracteres |
| `categoria` | ObjectId | **Obligatoria**, referencia a `Categoria` |
| `createdAt` / `updatedAt` | Date | Automáticos (`timestamps`) |

Además de validar el tipo de la referencia, el CRUD comprueba que la categoría exista antes
de crear un producto o cambiar su asociación.

## Mitigación XSS (HU-18)

El backend conserva los nombres y descripciones como texto. No intenta convertir HTML recibido
en HTML «limpio»: el escape depende del contexto donde se presenta y React ya codifica esos
valores al interpolarlos. Así, `<script>alert("xss")</script>` se almacena y se devuelve como una
cadena literal, nunca como código ejecutable.

Las direcciones de imagen sí se validan en la entrada porque terminan en un atributo `src`. El
modelo acepta únicamente URL absolutas con protocolo `http:` o `https:` y rechaza esquemas de
contenido activo como `javascript:` y `data:`. El frontend vuelve a comprobar la URL antes de
renderizarla como protección para datos antiguos o respuestas externas.

Las pruebas cubren tres controles:

- React codifica las etiquetas y los atributos introducidos como texto.
- El frontend no contiene puntos de inyección que omitan el escape de React.
- El modelo y la tarjeta rechazan protocolos de imagen distintos de HTTP(S).

## Pruebas

```bash
npm test      # pruebas unitarias, no necesitan base de datos
npm run check # comprueba que todos los archivos son sintácticamente válidos
```

Las pruebas que necesitan un MongoDB real se saltan salvo que se indique una base de datos
de pruebas. Para ejecutarlas también:

```bash
MONGODB_URI_TEST=mongodb://localhost:27017/all_in_la_pk_test npm test
```

> ⚠️ **Las colecciones usadas por las pruebas se vacían al terminar.** El clúster de Atlas se comparte con otro
> proyecto, así que las pruebas rechazan cualquier URI cuya base no termine en `_test`
> o `-test`. Si apuntas `MONGODB_URI_TEST` a `all_in_la_pk` (la base real) las pruebas
> fallan a propósito en vez de borrarla.

## Protección CSRF (HU-19)

Toda operación que modifica datos (`POST`, `PUT`, `PATCH`, `DELETE`) exige un token.
Las lecturas no.

### Cómo funciona

1. El cliente pide un token en `GET /api/csrf-token`.
2. El servidor lo devuelve **en el cuerpo** y además lo deja en la cookie `XSRF-TOKEN`.
3. El cliente lo reenvía en la cabecera `X-CSRF-Token`.
4. El servidor comprueba tres cosas: que cabecera y cookie coincidan, que la firma sea
   válida, y que el `Origin` sea uno permitido.

El token tiene la forma `valor.firma`, donde la firma es un HMAC-SHA256 del valor con
`CSRF_SECRET`. La cookie **no** es `HttpOnly`, porque el cliente necesita leerla; por eso
va firmada: que se pueda leer no basta para fabricar una válida.

> El frontend no lee la cookie, toma el token del cuerpo. En desarrollo leerla funcionaría
> —las cookies ignoran el puerto—, pero desplegados en dominios distintos JavaScript solo
> ve las cookies de su propio dominio.

### Demostración

```bash
# 1. Sin token: rechazado
curl -X POST http://localhost:4000/api/categorias   -H "Content-Type: application/json" -d '{"nombre":"Intruso"}'
# 403 {"error":"Falta el token CSRF..."}

# 2. Con token válido pero desde otro origen: rechazado
TOKEN=$(curl -s -c ck.txt http://localhost:4000/api/csrf-token | jq -r .csrfToken)
curl -b ck.txt -X POST http://localhost:4000/api/categorias   -H "Content-Type: application/json" -H "X-CSRF-Token: $TOKEN"   -H "Origin: https://sitio-malicioso.example" -d '{"nombre":"Intruso"}'
# 403 {"error":"Origen no permitido para esta operación"}

# 3. Token y origen correctos: aceptado
curl -b ck.txt -X POST http://localhost:4000/api/categorias   -H "Content-Type: application/json" -H "X-CSRF-Token: $TOKEN"   -H "Origin: http://localhost:5173" -d '{"nombre":"Tapetes"}'
# 201
```

### Para el despliegue (HU-25)

| Situación | Qué hace falta |
|---|---|
| Frontend y backend en el **mismo dominio** | Nada especial |
| En **dominios distintos** | La cookie necesita `SameSite=None; Secure`, que se activa solo con `FORZAR_HTTPS=true`. Obliga a HTTPS en ambos extremos. |

`CORS_ORIGIN` debe apuntar a la URL real del frontend desplegado: el backend rechaza cualquier
otro origen en las operaciones que modifican datos.

`CSRF_SECRET` debe estar fijado en producción. Sin él el servidor arranca igual, pero usa un
secreto aleatorio por proceso: cada reinicio invalidaría los tokens ya emitidos, y con varias
instancias cada una firmaría distinto.

## HTTPS (HU-20)

### Estrategia

| Entorno | Quién cifra | Certificado |
|---|---|---|
| **Producción** (HU-25) | El proveedor de despliegue termina TLS antes de llegar a Express | Emitido y renovado por el proveedor |
| **Desarrollo** | El propio Express, si se le dan certificados | Autofirmado, generado en local |

En producción el backend recibe tráfico ya descifrado detrás de un proxy, así que **no
necesita certificados**. Lo que sí necesita es saber que la petición original venía por HTTPS,
y eso se lo dice el proxy en la cabecera `X-Forwarded-Proto`.

Por eso hay dos interruptores separados:

| Variable | Para qué |
|---|---|
| `TRUST_PROXY` | Permite a Express leer `X-Forwarded-Proto`. **Solo detrás de un proxy real**: si se activara siempre, cualquier cliente podría enviar esa cabecera a mano y hacerse pasar por una conexión segura. |
| `FORZAR_HTTPS` | Redirige las peticiones sin cifrar con `308` y añade la cabecera `Strict-Transport-Security`. |

Se usa `308` y no `301` porque el `301` convierte un `POST` en `GET` y se perderían los datos
del formulario al redirigir.

### Probarlo en local

```bash
npm run certificados
```

Genera un certificado autofirmado en `backend/certs/` (ignorado por git) y te dice qué añadir
al `.env`. Después, `npm run dev` arranca en `https://localhost:4000`.

El navegador avisará de que el certificado no está firmado por una autoridad conocida: es lo
esperado en un autofirmado. Hay que aceptar la excepción; **el cifrado es real igualmente**.
Algunos navegadores integrados en otras herramientas lo rechazan sin dar opción, así que para
la demostración conviene usar Chrome o Firefox directamente.

### Evidencia

```
$ openssl s_client -connect localhost:4443 -servername localhost
subject=C=CO, O=All In La PK, CN=localhost
Protocol  : TLSv1.3
Cipher    : TLS_AES_256_GCM_SHA384

$ curl -skD - https://localhost:4443/api/health
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Las pruebas automáticas cubren la redirección, la cabecera HSTS y una petición real sobre TLS
comprobando la versión negociada.

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores. **`.env` nunca se sube al repositorio.**
