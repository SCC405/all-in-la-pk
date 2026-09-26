# Backend — All In La PK

API REST construida con **Node.js + Express + Mongoose**, conectada a **MongoDB Atlas**.
No renderiza vistas: únicamente recibe solicitudes, procesa la lógica y devuelve JSON (RNF-03).

## Estado

Pendiente de inicializar en **HU-01 — Configurar backend y conexión a base de datos** (Nicolay Baquero).

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
└── server.js
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

Documentación interactiva en `/api-docs` (Swagger UI).

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
