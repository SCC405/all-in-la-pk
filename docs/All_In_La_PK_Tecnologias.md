# Tecnologías del Proyecto — All In La PK

## 1. Introducción

**All In La PK** será una tienda en línea especializada en productos y accesorios de póker, como cartas, fichas, sets, mesas, tapetes y otros artículos relacionados.

La aplicación se desarrollará con una arquitectura separada entre **frontend** y **backend**, comunicados exclusivamente mediante una **API REST**.

Las tecnologías descritas en este documento corresponden a la propuesta técnica del equipo para cumplir con los requisitos definidos en el Examen Final.

---

## 2. Stack tecnológico general

| Área | Tecnología | Uso dentro del proyecto |
|---|---|---|
| Frontend | React | Construcción de la interfaz web |
| Lenguaje frontend | JavaScript | Lógica del cliente |
| Estilos | SCSS / Sass | Diseño y organización de estilos |
| Backend | Node.js | Entorno de ejecución del servidor |
| Framework backend | Express.js | Desarrollo de la API REST |
| Base de datos | MongoDB | Persistencia de categorías y productos |
| ODM | Mongoose | Modelado y acceso a MongoDB desde Node.js |
| Documentación API | Swagger / OpenAPI | Documentación y prueba de endpoints |
| Gestor de dependencias | npm | Instalación de librerías y ejecución de scripts |
| Control de versiones | Git | Seguimiento de cambios del código |
| Repositorios | GitHub | Trabajo colaborativo entre Nicolay y Chifu |
| Seguridad | HTTPS | Protección de la comunicación |
| Seguridad | Medidas anti-XSS | Mitigación de contenido malicioso |
| Seguridad | Protección CSRF | Protección de operaciones que modifican datos |
| Pruebas de API | Postman | Pruebas durante el desarrollo |
| Despliegue frontend | Por definir | Publicación del frontend |
| Despliegue backend | Por definir | Publicación de la API |
| Base de datos en nube | MongoDB Atlas | Base de datos accesible desde el backend desplegado |

---

# 3. Frontend

## React

Se utilizará **React** para construir la interfaz web de All In La PK.

Permitirá desarrollar componentes reutilizables para elementos como:

- Barra de navegación.
- Catálogo de productos.
- Tarjetas de productos.
- Filtros por categoría.
- Carrito de compras.
- Formularios administrativos.
- Listados de productos.
- Listados de categorías.

React también permitirá actualizar la información de la interfaz sin necesidad de recargar completamente la página.

### Responsabilidades principales del frontend

- Mostrar el catálogo.
- Consumir la API REST.
- Filtrar productos por categoría.
- Gestionar visualmente el carrito.
- Calcular y mostrar el total.
- Mostrar el panel de administración.
- Enviar formularios de productos y categorías.
- Mostrar mensajes de éxito y error.

---

# 4. JavaScript

El lenguaje principal del frontend será **JavaScript**.

También será utilizado en el backend mediante Node.js.

Esto permitirá trabajar con el mismo lenguaje en ambos proyectos.

JavaScript se utilizará para:

- Consumo de endpoints.
- Manejo del estado de la aplicación.
- Validación de formularios.
- Gestión del carrito.
- Manipulación de datos.
- Lógica del backend.
- Respuestas de la API.

---

# 5. SCSS / Sass

Los estilos del frontend se desarrollarán utilizando **SCSS**, debido a que el examen exige el uso de un preprocesador CSS.

SCSS permitirá organizar los estilos utilizando:

- Variables.
- Anidamiento.
- Archivos parciales.
- Mixins.
- Reutilización de estilos.

Se evitará utilizar CSS plano como sistema principal de estilos.

Una posible estructura será:

```text
src/
└── styles/
    ├── _variables.scss
    ├── _mixins.scss
    ├── _catalogo.scss
    ├── _carrito.scss
    ├── _admin.scss
    └── main.scss
```

---

# 6. Backend

## Node.js

Se utilizará **Node.js** como entorno de ejecución del backend.

Node.js permitirá desarrollar el servidor utilizando JavaScript y manejar las solicitudes provenientes del frontend.

## Express.js

Se utilizará **Express.js** para construir la API REST.

El backend no generará vistas HTML.

Su función será recibir solicitudes, procesar la lógica necesaria y devolver datos al frontend.

Ejemplos de rutas esperadas:

```text
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

---

# 7. Base de datos

## MongoDB

Se utilizará **MongoDB** como sistema de base de datos.

En ella se almacenará principalmente la información correspondiente a:

- Categorías.
- Productos.

Ejemplo conceptual:

```text
Categoria
- _id
- nombre
- descripcion

Producto
- _id
- nombre
- descripcion
- precio
- stock
- imagen
- categoria
```

Cada producto estará asociado a una categoría.

## MongoDB Atlas

Para facilitar el despliegue de la aplicación se propone utilizar **MongoDB Atlas**.

Esto permitirá que la base de datos sea accesible desde el backend desplegado sin depender del computador de Nicolay o Chifu.

---

# 8. Mongoose

Se utilizará **Mongoose** como ODM para conectar Express con MongoDB.

Permitirá:

- Definir esquemas.
- Crear modelos.
- Establecer campos obligatorios.
- Validar información.
- Consultar documentos.
- Crear productos y categorías.
- Actualizar información.
- Eliminar registros.

---

# 9. API REST

La comunicación entre el frontend y el backend se realizará exclusivamente mediante una **API REST**.

Ejemplo de arquitectura:

```text
Usuario
   ↓
Frontend React
   ↓
API REST - Express
   ↓
MongoDB
```

Y las respuestas:

```text
MongoDB
   ↓
Express
   ↓
JSON
   ↓
React
   ↓
Usuario
```

El backend devolverá principalmente información en formato **JSON**.

---

# 10. Swagger / OpenAPI

La API será documentada utilizando **Swagger/OpenAPI**.

Swagger permitirá consultar:

- Endpoints disponibles.
- Métodos HTTP.
- Parámetros.
- Cuerpos de las solicitudes.
- Respuestas.
- Códigos HTTP.

Además, permitirá probar la API desde una interfaz gráfica.

La documentación deberá permitir que una persona comprenda y pruebe la API sin necesidad de revisar el código fuente.

---

# 11. npm

Se utilizará **npm** como gestor de dependencias y automatizador de tareas.

Se utilizará para instalar y administrar librerías tanto en frontend como en backend.

Ejemplos:

```bash
npm install
npm run dev
npm start
npm run build
```

Las dependencias utilizadas quedarán registradas en:

```text
package.json
```

---

# 12. Git

Se utilizará **Git** como sistema de control de versiones.

Permitirá:

- Registrar cambios.
- Crear ramas.
- Recuperar versiones anteriores.
- Trabajar de forma independiente.
- Integrar el trabajo de los integrantes.

---

# 13. GitHub

El código será almacenado en **GitHub**.

Se recomienda utilizar dos repositorios separados:

```text
all-in-la-pk-frontend
all-in-la-pk-backend
```

Esto ayuda a mantener la separación real entre frontend y backend exigida por el proyecto.

## Ramas propuestas

```text
main
develop
feature/HU-XX-nombre
```

Ejemplos:

```text
feature/HU-03-crud-categorias
feature/HU-08-catalogo
feature/HU-14-admin-productos
```

El flujo recomendado será:

```text
Feature
   ↓
Pull Request
   ↓
develop
   ↓
Pruebas
   ↓
main
```

---

# 14. GitHub Projects

Se podrá utilizar **GitHub Projects** para organizar el Product Backlog y los Sprint Backlogs.

Columnas sugeridas:

```text
Backlog
To Do
In Progress
Review
Done
```

Cada Historia de Usuario podrá manejarse como un Issue de GitHub con descripción, criterios de aceptación, dependencias, subtareas, responsable, sprint y prioridad.

---

# 15. Postman

Durante el desarrollo se utilizará **Postman** como herramienta de pruebas de la API.

Permitirá validar operaciones como:

```text
GET
POST
PUT
PATCH
DELETE
```

Postman será una herramienta de desarrollo y pruebas.

El administrador final no deberá depender de Postman para gestionar productos o categorías, ya que esas operaciones deberán realizarse desde el panel administrativo.

---

# 16. Seguridad

## HTTPS

La versión final deberá utilizar **HTTPS** para proteger la comunicación entre el navegador y el servidor.

## Mitigación de XSS

La aplicación implementará medidas para evitar que entradas proporcionadas por un usuario puedan ejecutar código JavaScript malicioso.

Se validarán y tratarán adecuadamente los datos enviados mediante formularios.

## Protección CSRF

Las operaciones que modifiquen información deberán contar con protección contra solicitudes CSRF.

Se aplicará especialmente sobre operaciones como:

```text
POST
PUT
PATCH
DELETE
```

La implementación concreta se definirá durante el Sprint 2 según la arquitectura final de comunicación frontend-backend.

---

# 17. Despliegue

La aplicación deberá poder utilizarse desde un equipo diferente al computador de los desarrolladores.

Por esta razón será necesario desplegar:

1. Frontend.
2. Backend.
3. Base de datos.

## Propuesta

```text
Frontend React
      ↓
Servicio de despliegue frontend
      ↓
API Express
      ↓
Servicio de despliegue backend
      ↓
MongoDB Atlas
```

El proveedor específico para desplegar frontend y backend se definirá en una etapa posterior del proyecto.

---

# 18. Arquitectura tecnológica general

```text
┌───────────────────────────┐
│          USUARIO          │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│       FRONTEND REACT      │
│                           │
│ JavaScript                │
│ SCSS                      │
│ npm                       │
└─────────────┬─────────────┘
              │
              │ HTTPS / API REST
              ▼
┌───────────────────────────┐
│      BACKEND EXPRESS      │
│                           │
│ Node.js                   │
│ Express.js                │
│ Swagger / OpenAPI         │
│ Seguridad                 │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│          MONGODB          │
│                           │
│ MongoDB Atlas             │
│ Mongoose                  │
└───────────────────────────┘
```

---

# 19. Herramientas de trabajo del equipo

| Herramienta | Uso |
|---|---|
| Visual Studio Code | Desarrollo del proyecto |
| Git | Control de versiones |
| GitHub | Repositorios y colaboración |
| GitHub Projects | Product Backlog y Sprint Backlogs |
| Postman | Pruebas de API |
| Swagger | Documentación y pruebas de API |
| MongoDB Atlas | Base de datos en nube |
| npm | Dependencias y scripts |

---

# 20. Resumen del stack

```text
FRONTEND
React
JavaScript
SCSS
npm

BACKEND
Node.js
Express.js
JavaScript

BASE DE DATOS
MongoDB
MongoDB Atlas
Mongoose

API
REST
JSON
Swagger / OpenAPI

SEGURIDAD
HTTPS
Mitigación XSS
Protección CSRF

CONTROL DE VERSIONES
Git
GitHub
GitHub Projects

PRUEBAS
Postman
Swagger

DESPLIEGUE
Frontend: por definir
Backend: por definir
Base de datos: MongoDB Atlas
```

---

## Equipo

**Proyecto:** All In La PK  
**Integrantes:** Nicolay y Chifu  
**Metodología:** Scrum resumido  
**Sprints:** 3  
**Duración por Sprint:** 2 semanas
