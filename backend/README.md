# Backend — All In La PK

API REST construida con **Node.js + Express + Mongoose**, conectada a **MongoDB Atlas**.
No renderiza vistas: únicamente recibe solicitudes, procesa la lógica y devuelve JSON (RNF-03).

## Estado

Base del backend implementada en **HU-01 — Configurar backend y conexión a base de datos**.

- Servidor Express con respuestas JSON.
- Configuración mediante variables de entorno.
- Conexión a MongoDB mediante Mongoose.
- Manejo controlado de errores de configuración y conexión.
- Endpoint de salud en `GET /api/health`.
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

## Endpoints previstos

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

La documentación interactiva en `/api-docs` (Swagger UI) se incorporará en la HU-06.

### Categorías (implementado en HU-03)

| Método | Ruta | Respuesta correcta | Errores |
|---|---|---|---|
| `GET` | `/api/categorias` | `200` con la lista ordenada por nombre | — |
| `POST` | `/api/categorias` | `201` con la categoría creada | `400` datos no válidos · `409` nombre repetido |
| `PUT` | `/api/categorias/:id` | `200` con la categoría actualizada | `400` datos o id no válidos · `404` no existe · `409` nombre repetido |
| `DELETE` | `/api/categorias/:id` | `204` sin cuerpo | `400` id no válido · `404` no existe |

Solo se aceptan `nombre` y `descripcion` del cuerpo de la petición; cualquier otro campo se
ignora, de modo que un cliente no puede intentar fijar el `_id` ni las marcas de tiempo.

Forma de las respuestas de error:

```json
{ "error": "Datos no válidos",
  "detalles": { "nombre": "El nombre de la categoría es obligatorio." } }
```

`detalles` solo aparece cuando falla la validación del esquema, con un mensaje por campo
para que el formulario del panel administrativo pueda señalar exactamente qué corregir.

El endpoint `GET /api/health` ya está disponible como comprobación básica del backend. Los demás endpoints se implementarán en sus respectivas historias de usuario.

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

> ⚠️ **Esa base de datos se borra al terminar.** El clúster de Atlas se comparte con otro
> proyecto, así que las pruebas rechazan cualquier URI cuya base no termine en `_test`
> o `-test`. Si apuntas `MONGODB_URI_TEST` a `all_in_la_pk` (la base real) las pruebas
> fallan a propósito en vez de borrarla.

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores. **`.env` nunca se sube al repositorio.**
