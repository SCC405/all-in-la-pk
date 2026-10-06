# Guía de sustentación — All In La PK

Preparada el 6 de octubre de 2026. Todos los números de este documento están
verificados contra el código y contra producción ese día, no estimados.

**Equipo:** Nicolay Baquero ([@Nicolayyy](https://github.com/Nicolayyy)) y
Santiago Cifuentes ([@SCC405](https://github.com/SCC405)).

---

## 1. El resumen en una frase

> All In La PK es una tienda en línea de artículos de póker construida como dos
> proyectos independientes —un frontend en React y una API REST en Express— que
> se comunican solo por HTTP, con la base en MongoDB Atlas, documentación
> ejecutable en Swagger y desplegada en Render.

Si el profesor solo escucha una frase, que sea esa. Lo demás la desarrolla.

---

## 2. Estado real del proyecto

Dilo tú antes de que lo pregunte. Queda mucho mejor.

| | |
|---|---:|
| Historias de usuario cerradas | **22 de las 27 originales** |
| Puntos de historia completados | **83 de 115** |
| Sprints terminados | 2 de 3 (el tercero en curso) |
| Pruebas automáticas | **123 pasan** (71 backend + 52 frontend) |
| Pruebas que necesitan MongoDB | 3, se saltan solas si no hay base |
| Commits en `develop` | 40 |
| Pull requests | 33 |
| Reparto del trabajo | 20 commits cada uno |

**Producción, comprobada hoy:**

| Servicio | Dirección | Estado |
|---|---|---|
| Tienda | https://all-in-la-pk-web.onrender.com | `200` |
| API | https://all-in-la-pk-api.onrender.com/api/health | `200` |
| Swagger UI | https://all-in-la-pk-api.onrender.com/api-docs | `200` |
| OpenAPI JSON | https://all-in-la-pk-api.onrender.com/api-docs.json | `200` |

Con 8 productos y 6 categorías cargados.

### Lo que todavía está abierto

Decirlo vosotros demuestra control. Que lo descubra él, lo contrario. Todo lo de
abajo tiene issue abierto: no es una lista de olvidos, es trabajo planificado.

| Pendiente | Issue |
|---|---|
| Pruebas funcionales, validar seguridad, despliegue, errores finales, sustentación | HU-22 a HU-27 |
| `main` va 38 commits detrás de `develop`, y hay que verificar qué rama sigue Render | #73 |
| Dos PR de pulido visual (#59 y #60) se solapan: hay que elegir uno | #74 |
| Categoría de prueba «Nicolay» publicada en producción | #72 |
| La cabecera HSTS no llega a `/api/health` por el orden del middleware | #70 |
| `DESPLIEGUE.md` explica mal por qué `/api/health` está exento de la redirección | #71 |

### Lo que pidió el profesor

Tras la sustentación del 6 de octubre quedaron siete historias nuevas, todas en el
milestone Sprint 3 y etiquetadas `correccion sustentacion`:

| Historia | Issue |
|---|---|
| HU-28 — Autenticar al administrador en la API | #63 |
| HU-29 — Pantalla de inicio de sesión y sesión persistente | #64 |
| HU-30 — Ocultar y proteger el panel de administración | #65 |
| HU-31 — Resumen de la compra antes de pagar | #66 |
| HU-32 — Datos de envío y forma de pago | #67 |
| HU-33 — Confirmación de compra exitosa | #68 |
| HU-34 — Hacer la tienda más interactiva | #69 |

Son **40 puntos**, repartidos 16 para Chifu, 16 para Nicolay y 8 en equipo.

---

## 3. Antes de empezar — lista de verificación

> ### ⚠️ Lo más importante de todo este documento
>
> Render duerme los servicios gratuitos tras un rato sin tráfico. **La primera
> petición tarda cerca de un minuto.** Si abrís la tienda delante del profesor
> sin calentarla, vais a ver «No se pudo cargar el catálogo» y parecerá que no
> funciona.
>
> **Abrid las dos URL diez minutos antes de entrar y dejadlas cargadas.**

Checklist:

- [ ] Abrir https://all-in-la-pk-web.onrender.com y esperar a ver los productos.
- [ ] Abrir https://all-in-la-pk-api.onrender.com/api-docs y esperar a que cargue.
- [ ] Borrar la categoría de prueba «Nicolay» desde `/admin`.
- [ ] Tener pestañas ya abiertas: tienda, `/admin`, Swagger, repositorio en GitHub,
      tablero de issues.
- [ ] Tener una terminal abierta en la carpeta del proyecto para lanzar las pruebas.
- [ ] Preparar una imagen con URL válida para crear un producto en vivo
      (por ejemplo una de Wikimedia).
- [ ] Decidir quién habla de qué. Lo peor es interrumpiros entre vosotros.

---

## 4. Guion de la demostración

Pensado para unos 15–18 minutos. Los tiempos son orientativos.

### Paso 1 — Qué es y qué no es · 1 min

Enseñad la tienda ya cargada.

> «Es una tienda de artículos de póker: cartas, fichas, sets, tapetes. Se puede
> consultar el catálogo, filtrarlo, armar un carrito y administrar todo el
> catálogo desde un panel, sin tocar código ni usar Postman.»

Decid también el límite, porque demuestra que leísteis el enunciado:

> «Fuera del alcance: apuestas con dinero real, casino y pasarela de pagos.»

### Paso 2 — La arquitectura · 2 min

Abrid el diagrama del `README.md`.

> «Son **dos proyectos npm independientes**. El frontend no sabe nada de Mongo y
> el backend no renderiza ni una vista: solo devuelve JSON. Se hablan únicamente
> por la API REST. Eso es el requerimiento no funcional RNF-01, 02 y 03.»

Punto fuerte que conviene soltar aquí:

> «Cada uno tiene su propio `package.json`, su propio `package-lock.json` y sus
> propias pruebas. Se podrían desplegar en proveedores distintos — de hecho en
> Render son dos servicios separados.»

### Paso 3 — La tienda · 3 min

1. **Catálogo.** Señalad que cada tarjeta trae imagen, categoría, nombre,
   descripción, precio en pesos y disponibilidad.
2. **Filtro por categoría.** Elegid una. El contador de arriba se actualiza solo.
3. **Producto agotado.** Mostrad «Fichas de arcilla»: el botón está deshabilitado
   y no se puede añadir. La regla vive en el estado, no en el estilo.
4. **Carrito.** Añadid dos productos distintos, subid una cantidad, bajadla,
   quitad uno. Enseñad que el total se recalcula.

> «El carrito vive en un `useReducer` dentro de un contexto de React. Toda la
> lógica —sumar, restar, totalizar— está en funciones puras que se prueban solas,
> sin necesidad de renderizar nada.»

### Paso 4 — El panel de administración · 3 min

Id a `/admin`. Es el paso que más valora un profesor, porque es el CRUD completo.

1. **Crear una categoría** en vivo.
2. **Crear un producto** usando esa categoría. Que se vea que el selector ya la
   ofrece sin recargar la página.
3. **Provocar un error a propósito:** dejad el nombre vacío o poned un precio
   negativo y enviad. Se marca el campo, aparece el mensaje y **el foco salta al
   primer campo que falla**.
4. **Intentar borrar una categoría que tiene productos.** Sale un `409` con un
   mensaje que dice cuántos productos la están usando.
5. **Volver al catálogo** y mostrar el producto nuevo ya publicado.

> «El error 409 no es casualidad. Se comprueba **antes** de borrar: si borráramos
> primero, los productos quedarían apuntando a una categoría que ya no existe y
> el catálogo los mostraría sin categoría.»

### Paso 5 — La API por dentro · 3 min

Abrid https://all-in-la-pk-api.onrender.com/api-docs

> «La documentación no es un PDF que se queda viejo: es la especificación OpenAPI
> que genera el propio backend, y desde aquí se puede ejecutar.»

1. Desplegad `GET /api/productos` y pulsad **Try it out → Execute**.
2. Mostrad el JSON real que vuelve.
3. Señalad que `/api-docs.json` se importa en Postman tal cual.

Los endpoints:

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/health` | Comprobación de salud (la usa Render) |
| `GET` | `/api/csrf-token` | Emite el token CSRF |
| `GET` | `/api/categorias` | Lista categorías |
| `POST` | `/api/categorias` | Crea una categoría |
| `PUT` | `/api/categorias/{id}` | Actualiza una categoría |
| `DELETE` | `/api/categorias/{id}` | Borra una categoría |
| `GET` | `/api/productos` | Lista productos |
| `GET` | `/api/productos/{id}` | Un producto |
| `POST` | `/api/productos` | Crea un producto |
| `PUT` | `/api/productos/{id}` | Actualiza un producto |
| `DELETE` | `/api/productos/{id}` | Borra un producto |

### Paso 6 — Seguridad · 3 min

Las tres historias de seguridad, una por una. Ver la sección 7 para el detalle.

1. **XSS (HU-18).** Abrid las herramientas de desarrollo y mostrad que un nombre
   con `<script>` se guarda **como texto** y React lo escapa al pintarlo.
2. **CSRF (HU-19).** En la pestaña Red, enseñad la cookie `XSRF-TOKEN` y la
   cabecera `X-CSRF-Token` en un POST.
3. **HTTPS (HU-20).** El candado del navegador y la cabecera
   `Strict-Transport-Security` en la pestaña Red.

### Paso 7 — Cómo trabajamos · 2 min

Abrid el repositorio en GitHub.

1. **Issues:** 27 historias de usuario, cada una con sus criterios de aceptación.
2. **Pull requests:** 33, cada uno revisado por el otro integrante.
3. **Ramas:** `main` ← `develop` ← `feature/HU-XX-...`
4. **Reparto:** `git shortlog -sn` → 20 commits cada uno.

> «Nadie empuja directo a `develop`. Toda historia entra por pull request y la
> revisa el compañero. Por eso hay 33 PR para 40 commits.»

### Paso 8 — Las pruebas, en vivo · 1 min

```bash
npm test --prefix backend
```

```bash
npm test --prefix frontend
```

> «123 pruebas. Las 3 que se saltan son de integración y necesitan un MongoDB de
> verdad; hay un guardia que impide ejecutarlas contra la base real: la URL tiene
> que terminar en `_test`.»

### Paso 9 — El despliegue · 1 min

> «Está en Render, definido como infraestructura en código en `render.yaml`: la
> API como servicio Node y la tienda como sitio estático, cada uno con su dominio
> y su certificado TLS.»

---

## 5. Qué se construyó, por capas

### Base de datos — MongoDB Atlas con Mongoose

Dos colecciones.

**`Categoria`** — `nombre` (obligatorio, máx. 60, **único**), `descripcion`
(opcional, máx. 300), marcas de tiempo.

El índice único no es decorativo: dos categorías con el mismo nombre dejarían el
catálogo ambiguo y el visitante no sabría cuál filtrar.

**`Producto`** — `nombre` (máx. 100), `descripcion` (máx. 1000), `precio`
(número finito ≥ 0), `stock` (**entero** ≥ 0), `imagen` (URL http/https validada,
máx. 2048), `categoria` (referencia a `Categoria`, indexada).

La validación vive en el esquema, así que se aplica venga la petición de donde
venga: del panel, de Swagger o de Postman.

### Backend — Node.js + Express 5

```
backend/src/
├── app.js            # monta middlewares y rutas, en orden
├── config/           # entorno, conexión a Mongo, opciones de HTTPS
├── models/           # esquemas de Mongoose
├── controllers/      # lógica de cada operación
├── routes/           # qué URL llama a qué controlador
├── middlewares/      # CSRF, HTTPS/HSTS, 404, manejador de errores
├── docs/             # especificación OpenAPI
└── utils/            # validación de URL segura
```

El orden de `app.js` importa y conviene saber explicarlo: primero HTTPS, luego
CORS, luego el parseo del cuerpo, luego la documentación —antes que las rutas de
datos, para que `/api-docs` no caiga en el 404—, después salud y token CSRF
(que deben ser accesibles sin token), y **solo entonces** la protección CSRF y
las rutas que modifican datos.

### Frontend — React 18 + Vite + SCSS

```
frontend/src/
├── pages/        # Catalogo, Admin
├── components/   # Navbar, TarjetaProducto, FiltroCategorias,
│                 # CarritoResumen, AdminCategorias, AdminProductos
├── context/      # CarritoContext — estado global del carrito
├── services/     # apiCliente y los servicios de categorías y productos
├── utils/        # carrito, validaciones, filtrado, seguridad
└── styles/       # 10 parciales SCSS + main.scss
```

Los estilos están partidos en parciales con variables y mixins (HU-16), no en un
CSS gigante. Los colores y espaciados son variables de Sass, así que cambiar la
identidad es tocar un archivo.

---

## 6. Tecnologías e instalación

### Qué se instaló y por qué

**Backend** (`npm ci --prefix backend`)

| Paquete | Versión | Para qué |
|---|---|---|
| `express` | ^5.2.1 | Servidor HTTP y enrutado |
| `mongoose` | ^8.24.4 | Modelado y validación contra MongoDB |
| `cors` | ^2.8.6 | Permitir que el frontend, en otro dominio, llame a la API |
| `cookie-parser` | ^1.4.7 | Leer la cookie del token CSRF |
| `dotenv` | ^18.0.4 | Cargar variables de entorno sin subir secretos al repo |
| `swagger-ui-express` | ^5.0.1 | Servir la documentación navegable |
| `nodemon` | ^3.1.14 | *(desarrollo)* reiniciar al guardar |

**Frontend** (`npm ci --prefix frontend`)

| Paquete | Versión | Para qué |
|---|---|---|
| `react` / `react-dom` | ^18.3.1 | Interfaz por componentes |
| `react-router-dom` | ^7.18.4 | Rutas `/` y `/admin` sin recargar |
| `vite` | ^8.3.1 | *(desarrollo)* servidor y compilación |
| `@vitejs/plugin-react` | ^6.1.1 | *(desarrollo)* soporte de React en Vite |
| `sass` | ^1.105.1 | *(desarrollo)* compilar SCSS |

**Fuera de npm:** Node.js 20+, MongoDB Atlas, Git, GitHub, Render.

> Si pregunta por qué tan pocas dependencias: es deliberado. El CSRF, la
> redirección HTTPS y la validación están escritos con el módulo `crypto` de Node
> y con Mongoose, sin librerías extra. Menos superficie que auditar.

### Las pruebas no usan ninguna librería

`node --test`, el ejecutor que trae Node 20. Sin Jest, sin Mocha, sin Vitest.
Cero dependencias de prueba.

---

## 7. Seguridad, explicada para defenderla

### HU-18 · Mitigación de XSS

Dos capas.

1. **React escapa por defecto.** No se usa `dangerouslySetInnerHTML` en ninguna
   parte. Un nombre de producto que contenga `<script>alert(1)</script>` se
   guarda tal cual en la base y se **muestra como texto**, no se ejecuta.
2. **Validación de la URL de la imagen.** Es el único campo que acaba en un
   atributo del HTML (`src`). `esUrlHttpSegura()` acepta únicamente `http:` y
   `https:`, así que `javascript:alert(1)` o un `data:` con contenido activo se
   rechazan. Se valida en el modelo (servidor) **y** en el frontend antes de
   pintar.

### HU-19 · Protección CSRF

Patrón de **doble envío con token firmado**:

1. El frontend pide `GET /api/csrf-token`.
2. El servidor genera un token con la forma `valor.firma`, donde la firma es un
   **HMAC-SHA256** del valor con un secreto del servidor. Lo deja en la cookie
   `XSRF-TOKEN` y lo devuelve en el cuerpo.
3. En cada `POST`, `PUT` o `DELETE`, el frontend lo manda en la cabecera
   `X-CSRF-Token`.
4. El servidor comprueba **tres cosas**: que el `Origin` sea el esperado, que la
   cookie y la cabecera coincidan, y que la firma sea válida.

Detalles que suman si os preguntan:

- La comparación usa `timingSafeEqual`. Una comparación normal filtra cuántos
  caracteres acertó quien lo intenta a ciegas.
- Los métodos `GET`, `HEAD` y `OPTIONS` se dejan pasar: no modifican nada.
- El propio servidor se acepta como origen válido, porque Swagger UI se sirve
  desde ahí y sus peticiones de «Try it out» salen con ese `Origin`.

### HU-20 · HTTPS

- En producción, **Render termina TLS** y Express redirige con `308` lo que
  llegue sin cifrar. Se usa `308` y no `302` porque conserva el método y el
  cuerpo: un `POST` redirigido sigue siendo `POST`.
- Se anuncia **HSTS** un año (`max-age=31536000; includeSubDomains`), que es lo
  que recomienda OWASP.
- `trust proxy` se activa **solo** detrás de un proxy real. Si estuviera siempre
  activo, cualquiera podría mandar `X-Forwarded-Proto: https` y saltarse la
  redirección.
- En local hay certificados autofirmados: `npm run certificados --prefix backend`.

---

## 8. Preguntas que os puede hacer, con respuesta

### Sobre la arquitectura

**¿Por qué MongoDB y no una base relacional?**
El catálogo tiene dos entidades y una relación simple. Mongo encaja con el
formato JSON que ya habla la API, Atlas da la base gestionada sin instalar nada,
y Mongoose aporta validación de esquema, que es lo que echaríamos de menos de SQL.
Con un modelo de facturación y stock por bodega, la respuesta sería distinta.

**¿Por qué dos proyectos separados y no uno solo?**
Es el requerimiento RNF-01. Pero además permite desplegarlos por separado,
escalarlos distinto y sustituir el frontend sin tocar la API.

**¿Por qué dos servicios en Render?**
La tienda es HTML, CSS y JS ya compilados: se sirve como sitio estático, que es
más rápido y más barato. La API necesita un proceso Node vivo. Mezclarlos
obligaría a servir archivos estáticos desde Express sin ganar nada.

**¿El backend renderiza alguna vista?**
No, ninguna. Solo devuelve JSON. Es el RNF-03.

### Sobre seguridad

**¿Cómo evitan XSS?** → Sección 7. Mencionad las **dos** capas.

**La cookie del CSRF no es `httpOnly`. ¿No es un fallo?**
*(Es la pregunta trampa más probable.)* No, es necesario: en el patrón de doble
envío el frontend tiene que **leer** la cookie para reenviarla en la cabecera.
Precisamente por eso el token va **firmado con HMAC**: que alguien pueda leerla
no le sirve para fabricar un token válido sin el secreto del servidor. Y un
atacante en otro dominio no puede leerla de todos modos, por la política del
mismo origen.

**¿Qué pasa si no mando el token?**
`403` con un mensaje que explica cómo pedirlo. Se puede demostrar en vivo desde
Swagger.

**¿Validan solo en el cliente?**
No. En el cliente para no hacer un viaje de ida y vuelta por un error evidente,
y en el servidor porque el cliente **no es de fiar**: cualquiera puede llamar a
la API con `curl`. Las validaciones del servidor viven en el esquema de Mongoose,
así que se aplican venga la petición de donde venga.

**¿Guardan contraseñas?**
En lo presentado, no: el panel de administración no tenía login. El profesor lo
señaló en la sustentación y ya está planificado como **HU-28, HU-29 y HU-30**.
La contraseña se guardará con hash y sal usando `scrypt`, nunca en claro, y la
protección real estará en la API: ocultar el panel en React es comodidad, no
seguridad.

### Sobre los datos

**¿Qué pasa si borro una categoría que tiene productos?**
Devuelve `409` y dice cuántos productos la están usando. Se comprueba antes de
borrar, porque si borráramos primero los productos quedarían huérfanos.

**¿Puedo crear dos categorías con el mismo nombre?**
No, hay un índice único. La API responde `409`.

**¿Se puede poner un precio negativo o un stock decimal?**
No. El precio exige un número finito ≥ 0 y el stock un **entero** ≥ 0. Hay
pruebas para los dos casos.

**¿El carrito se guarda?**
No entre recargas: vive en memoria, en un `useReducer` dentro de un contexto de
React. Persistirlo no estaba en las historias del carrito (HU-10, 11, 12). Sería
añadir `localStorage` en el contexto, sin tocar nada más — ese es justamente el
beneficio de tener la lógica aislada en funciones puras.

### Sobre el proceso

**¿Cómo se repartieron el trabajo?**
Por historias de usuario, una rama por historia. `git shortlog -sn` da 20 commits
cada uno. Cada pull request lo revisó el otro.

**¿Qué pasó cuando algo salió mal?**
Hay ramas `fix/` para eso: categorías huérfanas, categorías compartidas en el
panel, diagnóstico de conexión a MongoDB, diagnóstico de DNS, plan del sitio
estático en Render. Se detectaron, se abrió issue y se corrigieron por PR.

**¿Qué prueban exactamente las 123 pruebas?**
Backend: modelos y sus validaciones, rutas CRUD, CSRF, redirección HTTPS,
manejador de errores, especificación OpenAPI y la conexión a base de datos.
Frontend: lógica del carrito, cantidades, total, filtrado, validaciones del
formulario, escapado XSS y que el SCSS compile conservando las reglas de
accesibilidad.

**¿Usaron inteligencia artificial?**
Responded con naturalidad y concretad: se usó como apoyo, y el código está
revisado, probado y discutido en los pull requests. Lo que demuestra criterio no
es haberla usado o no, sino poder explicar **por qué** cada decisión está tomada
así. Esta guía entera es eso.

### Sobre accesibilidad (si sale, suma mucho)

Los contrastes están **medidos**, no estimados. El verde de marca `#0F5132` da
1,82:1 sobre fondo oscuro y no cumple AA, así que para texto se usa `#3DB273`,
que da 6,34:1. Lo mismo con el rojo: `#B3261E` como relleno, `#E5534B` para texto.
Hay contorno de foco visible, objetivos táctiles de 44 píxeles, etiquetas para
lector de pantalla y respeto por `prefers-reduced-motion`.

---

## 9. Si algo falla en vivo

| Síntoma | Qué pasa | Qué decir y hacer |
|---|---|---|
| «No se pudo cargar el catálogo» | Render estaba dormido | «El plan gratuito duerme los servicios; dadme unos segundos.» Recargad. |
| Swagger tarda en abrir | Lo mismo | Igual. |
| Una imagen no carga | La URL externa falló | La tarjeta muestra un ♠ en su lugar: está contemplado. |
| Un `403` al crear algo | Falta el token CSRF | Recargad la página: se pide uno nuevo al entrar. |

**Plan B:** si Render no responde, levantad todo en local con
`npm run dev --prefix backend` y `npm run dev --prefix frontend`. Tenedlo probado
antes.

---

## 10. Chuleta

### Direcciones

```
Tienda     https://all-in-la-pk-web.onrender.com
API        https://all-in-la-pk-api.onrender.com/api
Swagger    https://all-in-la-pk-api.onrender.com/api-docs
OpenAPI    https://all-in-la-pk-api.onrender.com/api-docs.json
Repo       https://github.com/SCC405/all-in-la-pk
```

### Comandos

```bash
npm ci --prefix backend
```

```bash
npm ci --prefix frontend
```

```bash
npm run dev --prefix backend
```

```bash
npm run dev --prefix frontend
```

```bash
npm test --prefix backend
```

```bash
npm test --prefix frontend
```

> En PowerShell `&&` no funciona como separador. Por eso todos los comandos usan
> `--prefix` y van de uno en uno.

### Las cinco cifras que conviene llevar en la cabeza

**27** historias · **22** cerradas · **83/115** puntos · **123** pruebas ·
**33** pull requests.
