# Frontend — All In La PK

Interfaz web construida con **React + SCSS**, gestionada con **npm**.
Consume la API REST del backend; no accede nunca a la base de datos directamente.

## Estado

Inicializado en **HU-07** con React 18 + Vite. El **catálogo público** está implementado (HU-08).
Pendiente: filtro por categoría (HU-09), carrito (HU-10 a HU-12), panel administrativo
(HU-13 a HU-15) y migración de estilos a SCSS (HU-16).

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

Los estilos definitivos se escriben en **SCSS** (RNF-09) en **HU-16**. Por ahora están en CSS
plano en `src/styles/base.css`, con los colores de la identidad visual ya declarados como
variables para que esa migración sea directa.

### Colores de texto sobre superficie oscura

La paleta de [`docs/All_In_La_PK_Identidad_Visual.md`](../docs/All_In_La_PK_Identidad_Visual.md)
está pensada para **rellenos** (botón verde con texto blanco). Usada como **texto** sobre el gris
oscuro de las tarjetas no alcanza el mínimo de contraste AA de 4,5:1:

| Color | Como texto sobre `#1C1C1C` | AA |
|---|---:|---|
| Verde póker `#0F5132` | 1,82:1 | ❌ |
| Rojo cartas `#B3261E` | 2,61:1 | ❌ |
| Dorado `#D4AF37` | 8,10:1 | ✅ |
| Gris claro `#A7A7A7` | 7,08:1 | ✅ |

Por eso hay dos variables adicionales, solo para texto, que mantienen el tono de marca:

```css
--color-primario-texto: #3DB273;  /* 6,34:1 */
--color-peligro-texto:  #E5534B;  /* 4,60:1 */
```

Los colores de marca originales se siguen usando tal cual para fondos y rellenos.
