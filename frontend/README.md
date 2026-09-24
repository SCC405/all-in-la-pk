# Frontend — All In La PK

Interfaz web construida con **React + SCSS**, gestionada con **npm**.
Consume la API REST del backend; no accede nunca a la base de datos directamente.

## Estado

Inicializado en **HU-07** con React 18 + Vite. Pendiente: catálogo (HU-08), carrito (HU-10 a HU-12),
panel administrativo (HU-13 a HU-15) y migración de estilos a SCSS (HU-16).

## Puesta en marcha

```bash
npm install
cp .env.example .env    # ajustar VITE_API_URL si el backend no corre en el puerto 4000
npm run dev
```

La aplicación queda en `http://localhost:5173`. La pantalla de inicio muestra el estado de la
conexión con la API, así que sirve para comprobar de un vistazo si el backend está arriba.

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente lo compilado en `dist/` |

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
