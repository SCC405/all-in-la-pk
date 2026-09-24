# Frontend — All In La PK

Interfaz web construida con **React + SCSS**, gestionada con **npm**.
Consume la API REST del backend; no accede nunca a la base de datos directamente.

## Estado

Pendiente de inicializar en **HU-07 — Configurar frontend y comunicación con API** (Chifu).

## Estructura prevista

```
frontend/
├── src/
│   ├── components/      # Navbar, TarjetaProducto, FiltroCategorias, Carrito...
│   ├── pages/           # Catalogo, Carrito, Admin
│   ├── services/        # Cliente de la API REST
│   ├── context/         # Estado global del carrito
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _buttons.scss
│   │   ├── _forms.scss
│   │   ├── _cards.scss
│   │   ├── _navbar.scss
│   │   ├── _admin.scss
│   │   └── main.scss
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
└── package.json
```

## Vistas previstas

| Vista | Contenido |
|---|---|
| Catálogo | Listado de productos con filtro por categoría |
| Carrito | Productos agregados, cantidades y total |
| Administración | CRUD de categorías y de productos |

## Estilos

Todos los estilos se escriben en **SCSS** (RNF-09), usando las variables de la identidad
visual definidas en [`docs/All_In_La_PK_Identidad_Visual.md`](../docs/All_In_La_PK_Identidad_Visual.md).
