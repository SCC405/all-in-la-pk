# Documentación técnica — All In La PK

**Versión:** 1.0  
**Fecha:** 5 de octubre de 2026  
**Responsable:** Nicolay Baquero

Esta guía explica cómo está construido el sistema, cómo instalarlo y cómo ejecutarlo. La
documentación funcional y el alcance están en [Proyecto completo](All_In_La_PK_Proyecto_Completo.md);
la evidencia de que los módulos funcionan juntos está en [Integración](INTEGRACION.md).

## 1. Arquitectura

All In La PK utiliza una arquitectura cliente-servidor con tres partes independientes:

```text
Navegador
   │
   │ HTTPS / JSON
   ▼
Frontend React + Vite ───── API REST ─────▶ Backend Node.js + Express
                                                │
                                                │ Mongoose
                                                ▼
                                          MongoDB Atlas
```

- El **frontend** renderiza la interfaz y mantiene el carrito en memoria.
- El **backend** expone la API REST, valida las entradas y aplica las reglas de seguridad.
- **MongoDB** conserva categorías y productos. El navegador nunca se conecta directamente a
  la base de datos.
- Frontend y backend son proyectos npm independientes y se comunican exclusivamente por JSON.
- En producción, Render aloja los dos servicios y termina las conexiones TLS. MongoDB Atlas
  aloja la base de datos.

### Flujo de una lectura

1. React solicita categorías o productos mediante el cliente HTTP compartido.
2. Express recibe la petición, aplica HTTPS y CORS, y ejecuta la ruta correspondiente.
3. El controlador consulta MongoDB por medio de un modelo Mongoose.
4. La API responde JSON y React actualiza la vista.

### Flujo de una escritura

1. El formulario valida primero los campos en el navegador.
2. El cliente obtiene un token en `GET /api/csrf-token` si todavía no tiene uno.
3. Envía la cookie, la cabecera `X-CSRF-Token` y el cuerpo JSON.
4. El backend comprueba origen y token, vuelve a validar los datos y escribe en MongoDB.
5. La respuesta actualiza la lista visible sin recargar la página.

## 2. Estructura del repositorio

```text
all-in-la-pk/
├── backend/                 API REST y acceso a datos
│   ├── scripts/             Siembra y certificados locales
│   ├── src/
│   │   ├── config/          Entorno, MongoDB y TLS
│   │   ├── controllers/     Casos de uso de categorías y productos
│   │   ├── docs/            Contrato OpenAPI
│   │   ├── middlewares/     CSRF, HTTPS y manejo de errores
│   │   ├── models/          Esquemas Mongoose
│   │   ├── routes/          Rutas Express
│   │   └── utils/           Reglas de seguridad reutilizables
│   ├── test/                Pruebas unitarias y de integración
│   └── server.js            Conexión, servidor y cierre controlado
├── frontend/                Aplicación React
│   ├── src/
│   │   ├── components/      Componentes de catálogo, carrito y administración
│   │   ├── context/         Estado compartido del carrito
│   │   ├── pages/           Catálogo y panel administrativo
│   │   ├── services/        Cliente de la API y servicios por recurso
│   │   ├── styles/          Parciales SCSS
│   │   └── utils/           Filtros, validaciones, carrito y seguridad
│   └── test/                Pruebas unitarias del frontend
├── docs/                    Documentos del proyecto
├── scripts/                 Verificaciones integrales del repositorio
└── render.yaml              Infraestructura declarativa de producción
```

## 3. Frontend

El frontend usa React 18, React Router, Vite y Sass. Su punto de entrada es `src/main.jsx`,
que monta `App` dentro de `BrowserRouter` y `CarritoProvider`.

| Elemento | Responsabilidad |
|---|---|
| `pages/Catalogo.jsx` | Carga categorías y productos, filtra y compone las tarjetas. |
| `pages/Admin.jsx` | Comparte la lista de categorías entre los dos paneles CRUD. |
| `context/CarritoContext.jsx` | Expone productos, cantidades, total y operaciones del carrito. |
| `services/apiCliente.js` | Centraliza URL, JSON, cookies, CSRF, errores y reintento de un `403`. |
| `services/*Servicio.js` | Traduce operaciones de dominio a rutas REST. |
| `utils/` | Mantiene lógica pura que puede probarse sin el DOM. |
| `styles/main.scss` | Ensambla variables, mixins, componentes y accesibilidad. |

### Rutas de interfaz

| Ruta | Vista |
|---|---|
| `/` | Catálogo, filtro por categoría y carrito. |
| `/admin` | CRUD de categorías y productos. |

El carrito es estado de cliente: no se persiste en MongoDB ni sobrevive a una recarga completa.
Sí se conserva al navegar entre `/` y `/admin` porque el proveedor envuelve ambas rutas.

Las cadenas procedentes de la API se interpolan con JSX para que React las escape. Las imágenes
solo aceptan URL absolutas `http:` o `https:`. Los formularios asocian etiquetas y errores con
sus campos, mantienen foco visible y anuncian cambios importantes mediante `aria-live`.

## 4. Backend

El backend usa Node.js, Express 5 y Mongoose. `server.js` conecta la base antes de escuchar,
selecciona HTTP o HTTPS y cierra servidor y conexión ante `SIGINT` o `SIGTERM`. `src/app.js`
construye la aplicación por separado para que las pruebas HTTP no abran un puerto.

### Orden de middlewares

1. Confianza en el proxy, solo si `TRUST_PROXY=true`.
2. Redirección a HTTPS y HSTS.
3. CORS con credenciales.
4. Parseo de JSON, limitado a 1 MB, y cookies.
5. Swagger, salud y emisión del token CSRF.
6. Protección CSRF para métodos que modifican datos.
7. Rutas de categorías y productos.
8. Respuesta 404 y manejador central de errores.

### API REST

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/health` | Estado básico del servicio. |
| `GET` | `/api/csrf-token` | Emite token y cookie CSRF. |
| `GET` | `/api/categorias` | Lista categorías por nombre. |
| `POST` | `/api/categorias` | Crea una categoría. |
| `PUT` | `/api/categorias/:id` | Actualiza una categoría. |
| `DELETE` | `/api/categorias/:id` | Elimina una categoría sin productos asociados. |
| `GET` | `/api/productos` | Lista productos con su categoría poblada. |
| `GET` | `/api/productos/:id` | Obtiene un producto. |
| `POST` | `/api/productos` | Crea un producto. |
| `PUT` | `/api/productos/:id` | Actualiza un producto. |
| `DELETE` | `/api/productos/:id` | Elimina un producto. |

Las operaciones `POST`, `PUT`, `PATCH` y `DELETE` requieren cookie y cabecera CSRF. Los errores
de validación responden `400` con detalle por campo; un recurso inexistente responde `404`; un
nombre duplicado o una categoría con productos responde `409`. Los errores internos no exponen
la cadena de MongoDB.

## 5. Base de datos

MongoDB contiene dos colecciones administradas mediante Mongoose:

### Categoría

| Campo | Tipo | Reglas principales |
|---|---|---|
| `_id` | ObjectId | Generado por MongoDB. |
| `nombre` | String | Obligatorio, único, recortado, máximo 60 caracteres. |
| `descripcion` | String | Opcional, máximo 300 caracteres. |
| `createdAt`, `updatedAt` | Date | Generados automáticamente. |

### Producto

| Campo | Tipo | Reglas principales |
|---|---|---|
| `_id` | ObjectId | Generado por MongoDB. |
| `nombre` | String | Obligatorio, máximo 100 caracteres. |
| `descripcion` | String | Opcional, máximo 1000 caracteres. |
| `precio` | Number | Obligatorio, finito y no negativo. |
| `stock` | Number | Obligatorio, entero y no negativo. |
| `imagen` | String | URL HTTP(S) obligatoria, máximo 2048 caracteres. |
| `categoria` | ObjectId | Referencia obligatoria a `Categoria`, con índice. |
| `createdAt`, `updatedAt` | Date | Generados automáticamente. |

La API usa `populate` para devolver la categoría junto al producto. Antes de crear o actualizar
un producto comprueba que la categoría exista. Tampoco permite borrar una categoría que todavía
tenga productos, lo que evita referencias huérfanas.

## 6. Requisitos e instalación

- Git.
- Node.js 20 o superior; `.nvmrc` fija la versión principal esperada.
- npm.
- Una base MongoDB local o una cuenta de MongoDB Atlas.

```bash
git clone https://github.com/SCC405/all-in-la-pk.git
cd all-in-la-pk
npm ci --prefix backend
npm ci --prefix frontend
```

`npm ci` usa exactamente los archivos de bloqueo. Backend y frontend deben instalarse por
separado porque no existe un `package.json` en la raíz.

### Configuración local

En PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

En bash:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Completa `MONGODB_URI` y define un `CSRF_SECRET` estable en `backend/.env`. Los archivos `.env`
contienen secretos, están ignorados por Git y nunca deben subirse.

### Variables del backend

| Variable | Obligatoria | Valor local / propósito |
|---|---|---|
| `PORT` | No | `4000`; puerto HTTP(S). |
| `MONGODB_URI` | Sí | Cadena de MongoDB con nombre de base. |
| `NODE_ENV` | No | `development` o `production`. |
| `CORS_ORIGIN` | No | `http://localhost:5173`; único origen web autorizado. |
| `CSRF_SECRET` | En producción | Secreto que firma tokens CSRF. |
| `HTTPS_KEY_PATH` | No | Clave privada para HTTPS servido por Express en local. |
| `HTTPS_CERT_PATH` | No | Certificado correspondiente. Se configuran ambos o ninguno. |
| `TRUST_PROXY` | Solo tras proxy | Permite interpretar `X-Forwarded-Proto`. |
| `FORZAR_HTTPS` | No | Redirección `308`, HSTS y cookie segura. |

### Variable del frontend

| Variable | Valor local / propósito |
|---|---|
| `VITE_API_URL` | `http://localhost:4000/api`; base de todas las peticiones. |

## 7. Ejecución

Abre dos terminales desde la raíz del repositorio.

Terminal 1 — backend:

```bash
npm run dev --prefix backend
```

Terminal 2 — frontend:

```bash
npm run dev --prefix frontend
```

| Recurso | Dirección local |
|---|---|
| Tienda | <http://localhost:5173> |
| Administración | <http://localhost:5173/admin> |
| Salud de la API | <http://localhost:4000/api/health> |
| Swagger UI | <http://localhost:4000/api-docs> |
| OpenAPI JSON | <http://localhost:4000/api-docs.json> |

Para cargar los datos de demostración usa `npm run sembrar --prefix backend`. El script se niega
a reemplazar una base con datos salvo que se agregue `-- --confirmar`.

## 8. Swagger y contrato de la API

Swagger permanece disponible en `/api-docs` y la especificación OpenAPI en `/api-docs.json`.
La interfaz permite probar los endpoints con **Try it out**. Para una escritura, primero ejecuta
`GET /api/csrf-token`; Swagger comparte la cookie y coloca el token en las operaciones protegidas.

La especificación se mantiene en `backend/src/docs/openapi.js`. La prueba
`backend/test/openapi.test.js` compara las rutas reales de Express con las documentadas y falla
si una operación se agrega o elimina sin actualizar Swagger.

Producción:

- API: <https://all-in-la-pk-api.onrender.com>
- Swagger: <https://all-in-la-pk-api.onrender.com/api-docs>
- OpenAPI: <https://all-in-la-pk-api.onrender.com/api-docs.json>

## 9. Pruebas y verificaciones

```bash
npm test --prefix backend
npm run check --prefix backend
npm test --prefix frontend
npm run build --prefix frontend
node scripts/verificar-integracion.mjs
node scripts/verificar-documentacion.mjs
```

Las pruebas de persistencia requieren `MONGODB_URI_TEST`. La base debe terminar en `_test` o
`-test` porque sus colecciones se vacían al finalizar. Nunca uses la base real del proyecto.

## 10. Producción y diagnóstico

La configuración de Render está en [`render.yaml`](../render.yaml) y el procedimiento completo
en [Despliegue](DESPLIEGUE.md). Las direcciones vigentes son:

- Tienda: <https://all-in-la-pk-web.onrender.com>
- API: <https://all-in-la-pk-api.onrender.com>
- Swagger: <https://all-in-la-pk-api.onrender.com/api-docs>

| Síntoma | Revisión recomendada |
|---|---|
| La tienda abre sin productos | Backend activo, `VITE_API_URL` y recompilación del frontend. |
| El backend no inicia | `MONGODB_URI`, credenciales, IP permitida y estado del clúster. |
| Una escritura responde `403` | `CORS_ORIGIN`, cookie, token CSRF y uso de HTTPS entre dominios. |
| `/admin` devuelve `404` al recargar | Regla de reescritura a `/index.html` del sitio estático. |
| La primera petición tarda | El servicio gratuito puede estar despertando tras inactividad. |

Para decisiones de despliegue, HTTPS y variables de producción consulta
[Despliegue](DESPLIEGUE.md). Para resultados de extremo a extremo consulta
[Integración](INTEGRACION.md).
