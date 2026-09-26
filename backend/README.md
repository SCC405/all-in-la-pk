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

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores. **`.env` nunca se sube al repositorio.**
