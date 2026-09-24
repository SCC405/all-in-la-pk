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
| Nicolay | Desarrollador | [@Nicolayyy](https://github.com/Nicolayyy) |
| Chifu (Santiago) | Desarrollador | [@SCC405](https://github.com/SCC405) |

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

Requisitos: **Node.js 18+** y **npm**, más una cuenta de **MongoDB Atlas**.

```bash
git clone https://github.com/SCC405/all-in-la-pk.git
cd all-in-la-pk
```

### Backend

```bash
cd backend
npm install
cp .env.example .env    # completar con la cadena de conexión de MongoDB Atlas
npm run dev
```

API disponible en `http://localhost:4000/api` · Documentación Swagger en `http://localhost:4000/api-docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicación disponible en `http://localhost:5173`

> Las instrucciones detalladas se completan en **HU-24 (Documentación técnica)**.

## 🎨 Identidad visual

| Color | HEX | Uso |
|---|---|---|
| Verde póker | `#0F5132` | Color principal, botones, elementos activos |
| Verde oscuro | `#0A3622` | Navbar, footer, hover |
| Dorado | `#D4AF37` | Acentos, precios, elementos destacados |
| Negro carbón | `#0D0D0D` | Fondo principal |
| Gris oscuro | `#1C1C1C` | Tarjetas, formularios, superficies |
| Rojo cartas | `#B3261E` | Errores y acciones destructivas |
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

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [Proyecto completo](docs/All_In_La_PK_Proyecto_Completo.md) | Descripción, objetivos, alcance, requerimientos, product backlog y las 27 historias de usuario |
| [Tecnologías](docs/All_In_La_PK_Tecnologias.md) | Stack, arquitectura, flujo de trabajo Git y herramientas |
| [Identidad visual](docs/All_In_La_PK_Identidad_Visual.md) | Paleta, tipografía, componentes y variables SCSS |
| [Requerimientos](docs/All_In_La_PK_Requerimientos.docx) | RF y RNF consolidados |
| [Backlogs](docs/All_In_La_PK_Backlogs_Completos.xlsx) | Product Backlog y Sprint Backlogs en hoja de cálculo |

## 🤝 Cómo trabajamos

Antes de tu primer commit, lee [CONTRIBUTING.md](CONTRIBUTING.md): explica el flujo de ramas,
la convención de commits y cómo se cierra una historia de usuario.

---

<div align="center">
<sub>Proyecto de aula · Nicolay & Chifu · 2026</sub>
</div>
