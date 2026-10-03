# Frontend — All In La PK

Interfaz web construida con **React + SCSS**, gestionada con **npm**.
Consume la API REST del backend; no accede nunca a la base de datos directamente.

## Estado

Inicializado en **HU-07** con React 18 + Vite. El **catálogo público** (HU-08), su **filtro por
categoría** (HU-09) y la acción de **agregar al carrito** (HU-10) están implementados. Pendiente:
gestión de cantidades y total del carrito (HU-11 y HU-12), panel administrativo (HU-13 a HU-15)
y migración de estilos a SCSS (HU-16).

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
| `npm test` | Prueba la lógica del filtro por categoría y del carrito |

## Filtro del catálogo (HU-09)

El catálogo consulta productos y categorías desde la API. El selector permite mostrar todas las
categorías o limitar las tarjetas a una sola sin volver a solicitar los productos. El contador se
actualiza y se anuncia a tecnologías de asistencia; si una categoría no tiene productos, la vista
lo informa y permite regresar a «Todas las categorías».

El selector utiliza una etiqueta asociada, un área táctil mínima de 44 px y un foco visible para
navegación por teclado.

## Agregar productos al carrito (HU-10)

Cada producto disponible tiene una acción **Agregar al carrito**. El estado se comparte mediante
`CarritoProvider`, así que el contador y el resumen de la cabecera se actualizan inmediatamente y
sin recargar la página. El resumen muestra el nombre de cada producto y las unidades agregadas.

Los productos agotados no pueden agregarse. Los botones y el activador del carrito tienen un área
mínima de 44 px, foco visible y mensajes anunciados mediante una región `aria-live`.

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
| `/admin` | Administración: CRUD de categorías y productos | Implementada (HU-13, HU-14) |
| _por definir_ | Carrito con cantidades y total | HU-10 a HU-12 |

La navegación usa **react-router-dom**, así que cada vista tiene su propia URL y se puede
enlazar directamente — útil para la sustentación.

### Panel de administración

Permite crear, consultar, editar y eliminar categorías y productos sin usar Postman (RF-15 y
RF-16). Los cambios se reflejan en las listas sin recargar la página (RNF-13). Cada producto puede
asociarse a una categoría y registrar nombre, descripción, precio, stock e imagen.

Los errores de la API se muestran donde corresponde: los de validación junto al campo que los
provoca, y los generales —nombre repetido (`409`) o categoría con productos asociados (`409`)—
como aviso del formulario.

## Carrito

Vive en el cliente, sin tocar la API: el estado está en `src/context/CarritoContext.jsx`
y la lógica pura en `src/utils/carrito.js`, separada para poder probarla sin DOM.

Los productos se guardan como `{ producto, cantidad }`. Desde el panel del carrito se puede
aumentar, disminuir o quitar cada línea (HU-11):

| Regla | Comportamiento |
|---|---|
| Límite superior | No se puede pasar del stock del producto; el botón `+` se deshabilita |
| Límite inferior | Disminuir se detiene en 1, no baja a cero |
| Eliminar | Hay un botón «Quitar» aparte, para que nadie borre una línea sin querer al bajar la cantidad |

Cada cambio se anuncia en una región `aria-live`, porque quien usa lector de pantalla no ve
que el número de al lado cambió.

Cada línea muestra su subtotal (`precio × cantidad`) y el pie del panel suma el total completo
en pesos colombianos (HU-12). Ambos valores se calculan a partir de `items`; no se guardan como
estado duplicado, de modo que siempre cambian junto con las cantidades y al quitar productos.
El total actualizado se anuncia mediante `aria-live`.

## Validación de formularios (HU-15)

Los formularios del panel validan **en el cliente antes de llamar a la API**
(`src/utils/validaciones.js`). El servidor sigue siendo la autoridad; esto solo evita el viaje
de ida y vuelta cuando el error es evidente.

Los mensajes son **literalmente los mismos** que devuelve el esquema de Mongoose, y hay una
prueba que lo comprueba palabra por palabra. Si divergieran, el administrador vería dos textos
distintos para el mismo fallo según quién lo detectara.

El resultado tiene la forma `{ campo: mensaje }`, igual que el `detalles` de la API, así que la
interfaz muestra los errores igual venga de donde venga.

Al enviar con errores, el foco salta al **primer campo que falla en el orden de la pantalla**, y
el error de un campo desaparece en cuanto se corrige, en vez de quedarse en rojo hasta el
siguiente envío.

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

## Mitigación XSS (HU-18)

Los nombres y descripciones escritos desde el panel se renderizan mediante interpolación JSX.
React los codifica según el contexto, por lo que una entrada como
`<script>alert("xss")</script>` aparece literalmente como texto y no crea un elemento `script`.
El frontend no utiliza puntos de inyección que omitan ese escape.

Las imágenes tienen una barrera adicional: solamente se asignan al atributo `src` las URL
absolutas con protocolo `http:` o `https:`. Si la API entrega un valor antiguo o inseguro
(`javascript:`, `data:` o una URL inválida), la tarjeta muestra el marcador de imagen ausente.

La suite automatizada recorre `src/` y falla si se introduce una API que interprete cadenas
como HTML. También demuestra el escape con un payload que combina `script`, `img` y `onerror`:

```bash
npm test
```

Para demostrarlo en la interfaz, registra temporalmente un producto con
`<script>alert("xss")</script>` como nombre y una imagen HTTPS válida. El catálogo debe mostrar
la etiqueta literalmente, sin abrir diálogos ni ejecutar código. Una imagen con
`javascript:alert("xss")` debe ser rechazada por la API.
