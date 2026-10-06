<div align="center">

# ♠️ All In La PK

**Tienda en línea de artículos y accesorios de póker**

Proyecto de aula — Tienda en Línea Modular
React · Node.js · Express · MongoDB · SCSS · Swagger

</div>

---

## 📋 Descripción

**All In La PK** es una tienda en línea especializada en la venta de productos y accesorios
relacionados con el póker: cartas, fichas, sets, mesas, tapetes, maletines y más.

La plataforma permite consultar un catálogo organizado por categorías, visualizar productos,
agregarlos a un carrito y administrar el catálogo completo desde un panel administrativo,
sin depender de Postman ni de modificar código.

> **Fuera del alcance:** apuestas con dinero real, casino o juegos de azar, procesamiento de
> apuestas y pasarela de pagos.

## 👥 Equipo

| Integrante | Rol | GitHub |
|---|---|---|
| Nicolay Baquero | Desarrollador | [@Nicolayyy](https://github.com/Nicolayyy) |
| Santiago Cifuentes | Desarrollador | [@SCC405](https://github.com/SCC405) |

**Metodología:** Scrum resumido/adaptado — 3 sprints de 2 semanas · 115 puntos de historia.

## 🏗️ Arquitectura

```
┌─────────────┐   HTTPS    ┌──────────────────┐            ┌─────────────────┐
│  Navegador  │ ─────────▶ │  Frontend React  │            │  MongoDB Atlas  │
└─────────────┘            │  JavaScript      │            └────────▲────────┘
                           │  SCSS · npm      │                     │
                           └────────┬─────────┘                     │ Mongoose
                                    │  API REST (JSON)              │
                                    ▼                               │
                           ┌──────────────────┐                     │
                           │ Backend Express  │ ────────────────────┘
                           │ Swagger/OpenAPI  │
                           │ HTTPS · XSS · CSRF│
                           └──────────────────┘
```

El **frontend** y el **backend** son proyectos independientes (RNF-01) que se comunican
**exclusivamente** mediante una API REST (RNF-02). El backend no renderiza vistas (RNF-03).

## 📁 Estructura del repositorio

```
all-in-la-pk/
├── backend/      # API REST — Node.js + Express + Mongoose (proyecto npm independiente)
├── frontend/     # Interfaz web — React + SCSS (proyecto npm independiente)
├── docs/         # Documentación del proyecto, requerimientos, backlogs e identidad visual
└── .github/      # Plantillas de issues y pull requests
```

## 🛠️ Stack tecnológico

| Área | Tecnología |
|---|---|
| Frontend | React · JavaScript · SCSS/Sass |
| Backend | Node.js · Express.js |
| Base de datos | MongoDB · MongoDB Atlas · Mongoose |
| API | REST · JSON · Swagger/OpenAPI |
| Seguridad | HTTPS · Mitigación XSS · Protección CSRF |
| Gestor de dependencias | npm |
| Control de versiones | Git · GitHub · GitHub Projects |
| Pruebas de API | Postman · Swagger UI |

## 🚀 Puesta en marcha

Requisitos: **Node.js 20 o superior** (hay un `.nvmrc`) y **npm**. Para la base de datos,
una cuenta de **MongoDB Atlas** o un MongoDB local.

```bash
git clone https://github.com/SCC405/all-in-la-pk.git
```

Backend y frontend son proyectos npm **independientes**: cada uno tiene sus dependencias y
se instala por separado. Los comandos de abajo usan `--prefix` para no tener que entrar y
salir de carpetas, y funcionan igual en PowerShell, CMD y bash.

### 1. Instalar

```bash
npm ci --prefix backend
```

```bash
npm ci --prefix frontend
```

> `npm ci` instala exactamente lo que dice el `package-lock.json`. Usa `npm install` solo
> cuando vayas a añadir o actualizar una dependencia.

### 2. Configurar el backend

```bash
cp backend/.env.example backend/.env
```

Completa `MONGODB_URI` en ese archivo. **Nunca se sube al repositorio.** El resto de
variables traen valores válidos para desarrollo.

### 3. Arrancar

Hacen falta **dos terminales**, una para cada proyecto:

```bash
npm run dev --prefix backend
```

```bash
npm run dev --prefix frontend
```

| Dirección | Qué es |
|---|---|
| `http://localhost:5173` | La tienda |
| `http://localhost:4000/api` | La API REST |
| `http://localhost:4000/api-docs` | Swagger UI: documentación navegable y ejecutable |
| `http://localhost:4000/api-docs.json` | Especificación OpenAPI, importable en Postman |

### 4. Datos de ejemplo (opcional)

```bash
npm run sembrar --prefix backend
```

Crea 5 categorías y 8 productos para ver la tienda con contenido. Si la base ya tiene datos
se niega a continuar, porque sembrar los borra; para forzarlo, `npm run sembrar --prefix backend -- --confirmar`.

## 📜 Comandos disponibles

### Backend

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor con reinicio automático al guardar |
| `npm start` | Servidor en modo normal |
| `npm test` | Pruebas. Las de integración se saltan si no hay base de datos de pruebas |
| `npm run check` | Comprueba que todos los archivos sean sintácticamente válidos |
| `npm run sembrar` | Llena la base con datos de ejemplo |
| `npm run certificados` | Genera certificados autofirmados para probar HTTPS en local |

Para ejecutar también las pruebas que necesitan MongoDB:

```bash
MONGODB_URI_TEST=mongodb://localhost:27017/all_in_la_pk_test npm test --prefix backend
```

> La base debe terminar en `_test` o `-test`: las pruebas borran datos al terminar y hay un
> guardia que impide apuntarlas por error a la base real.

### Frontend

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente lo ya compilado |
| `npm test` | Pruebas unitarias |


## 🎨 Identidad visual

| Color | HEX | Uso |
|---|---|---|
| Verde póker | `#0F5132` | Color principal, botones, elementos activos |
| Verde oscuro | `#0A3622` | Navbar, footer, hover |
| Verde texto | `#3DB273` | Texto verde accesible sobre superficies oscuras |
| Dorado | `#D4AF37` | Acentos, precios, elementos destacados |
| Negro carbón | `#0D0D0D` | Fondo principal |
| Gris oscuro | `#1C1C1C` | Tarjetas, formularios, superficies |
| Rojo cartas | `#B3261E` | Errores y acciones destructivas |
| Rojo texto | `#E5534B` | Texto de error accesible sobre superficies oscuras |
| Blanco humo | `#F5F5F5` | Texto principal |
| Gris claro | `#A7A7A7` | Texto secundario |

Detalle completo en [`docs/All_In_La_PK_Identidad_Visual.md`](docs/All_In_La_PK_Identidad_Visual.md).

## 🗓️ Sprints

| Sprint | Enfoque | Puntos |
|---|---|---:|
| **Sprint 1** | Backend, base de datos, Swagger, CRUD y catálogo | 38 |
| **Sprint 2** | Carrito, panel administrador, SCSS y seguridad | 45 |
| **Sprint 3** | Integración, pruebas, documentación, despliegue y sustentación | 32 |

El backlog vive como **issues** de este repositorio y se organiza en el
[tablero del proyecto](https://github.com/SCC405/all-in-la-pk/projects).

## ☁️ Despliegue

La aplicación se publica en Render como **dos servicios independientes**: la API como servicio
Node y la tienda como sitio estático, cada uno con su propia URL y su certificado TLS.

La configuración vive en [`render.yaml`](render.yaml) y los pasos en
[`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md).

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [Documentación técnica](docs/DOCUMENTACION_TECNICA.md) | Arquitectura, frontend, backend, base de datos, instalación, ejecución y Swagger |
| [Proyecto completo](docs/All_In_La_PK_Proyecto_Completo.md) | Descripción, objetivos, alcance, requerimientos, product backlog y las 27 historias de usuario |
| [Tecnologías](docs/All_In_La_PK_Tecnologias.md) | Stack, arquitectura, flujo de trabajo Git y herramientas |
| [Identidad visual](docs/All_In_La_PK_Identidad_Visual.md) | Paleta, tipografía, componentes y variables SCSS |
| [Requerimientos](docs/All_In_La_PK_Requerimientos.docx) | RF y RNF consolidados |
| [Backlogs](docs/All_In_La_PK_Backlogs_Completos.xlsx) | Product Backlog y Sprint Backlogs en hoja de cálculo |
| [Despliegue](docs/DESPLIEGUE.md) | Cómo publicar la aplicación en Render y por qué está configurada así |
| [Integración](docs/INTEGRACION.md) | Evidencia de HU-21: catálogo, carrito, panel y CRUD contra producción |

## 🤝 Cómo trabajamos

Antes de tu primer commit, lee [CONTRIBUTING.md](CONTRIBUTING.md): explica el flujo de ramas,
la convención de commits y cómo se cierra una historia de usuario.

---

<div align="center">
<sub>Proyecto de aula · Nicolay Baquero & Santiago Cifuentes · 2026</sub>
</div>
