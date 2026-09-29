# Frontend — All In La PK

Interfaz web construida con **React + SCSS**, gestionada con **npm**.
Consume la API REST del backend; no accede nunca a la base de datos directamente.

## Estado

Inicializado en **HU-07** con React 18 + Vite. El **catálogo público** (HU-08) y su **filtro por
categoría** (HU-09) están implementados. Pendiente: carrito (HU-10 a HU-12), panel
administrativo (HU-13 a HU-15) y migración de estilos a SCSS (HU-16).

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
| `npm test` | Prueba la lógica del filtro por categoría |

## Filtro del catálogo (HU-09)

El catálogo consulta productos y categorías desde la API. El selector permite mostrar todas las
categorías o limitar las tarjetas a una sola sin volver a solicitar los productos. El contador se
actualiza y se anuncia a tecnologías de asistencia; si una categoría no tiene productos, la vista
lo informa y permite regresar a «Todas las categorías».

El selector utiliza una etiqueta asociada, un área táctil mínima de 44 px y un foco visible para
navegación por teclado.

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

| Ruta | Vista | Estado |
|---|---|---|
| `/` | Catálogo con filtro por categoría | Implementada (HU-08, HU-09) |
| `/admin` | Administración: CRUD de categorías | Categorías en HU-13; productos en HU-14 |
| _por definir_ | Carrito con cantidades y total | HU-10 a HU-12 |

La navegación usa **react-router-dom**, así que cada vista tiene su propia URL y se puede
enlazar directamente — útil para la sustentación.

### Panel de administración

Permite crear, consultar, editar y eliminar categorías sin usar Postman (RF-15). Los cambios
se reflejan en la lista sin recargar la página (RNF-13).

Los errores de la API se muestran donde corresponde: los de validación junto al campo que los
provoca, y los generales —nombre repetido (`409`) o categoría con productos asociados (`409`)—
como aviso del formulario.

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
