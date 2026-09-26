# All In La PK

## Proyecto de aula — Tienda en Línea Modular

**Integrantes:** Nicolay Baquero, Santiago Cifuentes

**Metodología:** Scrum resumido/adaptado — 3 sprints de 2 semanas.

**Base del alcance:** Documento “Examen final” del curso, complementado con las decisiones del equipo para la temática, tecnologías y organización del trabajo.

## 1. Descripción del proyecto

All In La PK será una tienda en línea especializada en la venta de productos y accesorios relacionados con el póker. La plataforma permitirá consultar un catálogo organizado por categorías, visualizar productos, agregarlos a un carrito y administrar productos y categorías desde un panel.

## 2. Planteamiento del problema

Las personas interesadas en adquirir productos especializados para jugar póker suelen encontrar estos artículos distribuidos entre tiendas generales, redes sociales y diferentes plataformas. Esto dificulta encontrar en un mismo lugar cartas, fichas, mesas, tapetes, sets completos y accesorios. Para el negocio, gestionar precios, stock y categorías de forma manual o desde distintos medios puede generar información desactualizada y errores. All In La PK propone centralizar esta gestión mediante una tienda web con catálogo, carrito y panel administrativo.

## 3. Objetivo general

Desarrollar una aplicación web de comercio electrónico llamada All In La PK, orientada a la venta de productos y accesorios de póker, mediante una arquitectura con frontend y backend independientes comunicados por una API REST.

## 4. Objetivos específicos

- Diseñar un catálogo digital de productos organizado por categorías.
- Implementar la gestión CRUD de categorías y productos.
- Desarrollar un carrito que permita agregar, quitar y modificar cantidades, calculando automáticamente el total.
- Crear un panel administrativo que permita gestionar el catálogo sin depender de Postman.
- Documentar la API REST mediante Swagger/OpenAPI.
- Aplicar HTTPS, mitigación XSS y protección CSRF.
- Utilizar SCSS y un gestor de dependencias/automatizador en el frontend.
- Desplegar la aplicación para que pueda ser probada desde un equipo diferente al de los integrantes.

## 5. Alcance

La solución abarcará una tienda web funcional para productos de póker. Los visitantes podrán consultar el catálogo, filtrar por categoría y gestionar un carrito. El administrador podrá crear, consultar, editar y eliminar categorías y productos mediante la interfaz. Frontend y backend serán proyectos independientes conectados exclusivamente por API REST.

### Exclusiones del alcance
- Apuestas con dinero real.
- Casino o juegos de azar dentro de la aplicación.
- Procesamiento de apuestas.
- Pasarela de pagos.
- Registro e inicio de sesión de usuarios, salvo que el docente lo solicite posteriormente.
- Procesamiento formal de pedidos o checkout, salvo que el docente lo solicite posteriormente.

## 6. Categorías iniciales propuestas
- Cartas y barajas
- Fichas de póker
- Sets de póker
- Mesas de póker
- Tapetes
- Maletines
- Botones de dealer y accesorios
- Porta fichas y organizadores

## 7. Arquitectura general

- **Frontend:** React + SCSS
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB
- **API:** API REST documentada con Swagger/OpenAPI
- **Flujo:** Usuario → Frontend React → API REST Express → MongoDB

> React, Express y MongoDB son decisiones tecnológicas del equipo; el examen exige la separación real entre frontend y backend y la comunicación por API REST.

## 8. Metodología de desarrollo

Scrum resumido/adaptado para un equipo de dos personas. Se mantendrá un Product Backlog general y se trabajará en 3 sprints de 2 semanas. Cada sprint tendrá Sprint Goal, Sprint Backlog, responsables y revisión de resultados. La carga se distribuirá de forma equitativa entre Nicolay Baquero y Santiago Cifuentes.

| Sprint | Semanas | Enfoque |
|---|---|---|
| Sprint 1 | 11–12 | Backend, base de datos, Swagger, CRUD y catálogo |
| Sprint 2 | 13–14 | Carrito, panel administrador, SCSS y seguridad |
| Sprint 3 | 15–16 | Integración, pruebas, documentación, despliegue y sustentación |

## 9. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-01 | El sistema deberá permitir al administrador crear nuevas categorías de productos. |
| RF-02 | El sistema deberá permitir consultar y listar todas las categorías registradas. |
| RF-03 | El sistema deberá permitir modificar la información de una categoría existente. |
| RF-04 | El sistema deberá permitir eliminar una categoría. |
| RF-05 | El sistema deberá permitir crear productos y asociar cada producto a una categoría. |
| RF-06 | El sistema deberá permitir consultar y listar los productos registrados. |
| RF-07 | El sistema deberá permitir modificar la información de un producto existente. |
| RF-08 | El sistema deberá permitir eliminar productos. |
| RF-09 | El sistema deberá mostrar un catálogo público con los productos disponibles de All In La PK. |
| RF-10 | El visitante deberá poder seleccionar una categoría y visualizar únicamente los productos pertenecientes a ella. |
| RF-11 | El usuario deberá poder agregar productos al carrito de compras. |
| RF-12 | El usuario deberá poder eliminar productos del carrito de compras. |
| RF-13 | El usuario deberá poder modificar la cantidad de cada producto agregado al carrito. |
| RF-14 | El sistema deberá calcular automáticamente el valor total del carrito. |
| RF-15 | El administrador deberá poder gestionar las categorías mediante una interfaz gráfica, sin utilizar Postman ni modificar código. |
| RF-16 | El administrador deberá poder gestionar los productos mediante una interfaz gráfica, sin utilizar Postman ni modificar código. |
| RF-17 | Las operaciones realizadas sobre productos y categorías deberán reflejarse en la interfaz sin recargar completamente la página. |
| RF-18 | El administrador deberá poder registrar y actualizar nombre, descripción, precio, stock, imagen y categoría de cada producto. |

## 10. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El frontend y el backend deberán ser proyectos independientes. |
| RNF-02 | Toda comunicación entre frontend y backend deberá realizarse mediante una API REST. |
| RNF-03 | El backend no deberá renderizar vistas; únicamente deberá procesar solicitudes y exponer datos. |
| RNF-04 | La API deberá estar documentada mediante Swagger/OpenAPI. |
| RNF-05 | La documentación Swagger deberá permitir que un tercero comprenda y pruebe los endpoints sin revisar el código fuente. |
| RNF-06 | La aplicación deberá utilizar HTTPS. |
| RNF-07 | La aplicación deberá implementar medidas de mitigación frente a ataques XSS. |
| RNF-08 | Las operaciones que modifiquen información deberán contar con protección frente a CSRF. |
| RNF-09 | El frontend deberá utilizar SCSS como preprocesador de estilos. |
| RNF-10 | El frontend deberá utilizar explícitamente un gestor de dependencias o automatizador de tareas, en este caso npm. |
| RNF-11 | La información de productos y categorías deberá almacenarse de manera persistente en la base de datos. |
| RNF-12 | La interfaz administrativa deberá ser suficientemente clara para que una persona sin conocimientos técnicos pueda crear productos y categorías. |
| RNF-13 | Las operaciones CRUD deberán actualizar la interfaz sin provocar una recarga completa de la página. |
| RNF-14 | HTTPS, mitigación XSS y protección CSRF deberán poder demostrarse mediante casos concretos durante la sustentación. |
| RNF-15 | La aplicación final deberá estar desplegada o ejecutándose en un entorno accesible para personas diferentes a los integrantes del equipo. |
| RNF-16 | La aplicación no podrá depender exclusivamente del computador de Nicolay Baquero o Santiago Cifuentes para su demostración. |
| RNF-17 | El proyecto deberá contar con documentación técnica suficiente para comprender su estructura, instalación, ejecución y funcionamiento. |

## 11. Product Backlog

| ID | Historia | Prioridad | Puntos | Dependencias | Sprint | Responsable |
|---|---|---|---:|---|---:|---|
| HU-01 | Configurar backend y conexión a base de datos | Muy alta | 5 | Ninguna | 1 | Nicolay Baquero |
| HU-02 | Crear modelo de categorías | Muy alta | 3 | HU-01 | 1 | Santiago Cifuentes |
| HU-03 | CRUD REST de categorías | Muy alta | 5 | HU-02 | 1 | Santiago Cifuentes |
| HU-04 | Crear modelo de productos | Muy alta | 3 | HU-01, HU-02 | 1 | Nicolay Baquero |
| HU-05 | CRUD REST de productos | Muy alta | 8 | HU-04 | 1 | Nicolay Baquero |
| HU-06 | Documentar API con Swagger/OpenAPI | Alta | 3 | HU-03, HU-05 | 1 | Santiago Cifuentes |
| HU-07 | Configurar frontend y comunicación con API | Muy alta | 3 | Ninguna | 1 | Santiago Cifuentes |
| HU-08 | Visualizar catálogo público | Muy alta | 5 | HU-05, HU-07 | 1 | Santiago Cifuentes |
| HU-09 | Filtrar catálogo por categoría | Alta | 3 | HU-03, HU-08 | 1 | Nicolay Baquero |
| HU-10 | Agregar productos al carrito | Muy alta | 3 | HU-08 | 2 | Nicolay Baquero |
| HU-11 | Gestionar cantidades y eliminar del carrito | Muy alta | 5 | HU-10 | 2 | Santiago Cifuentes |
| HU-12 | Calcular total del carrito | Muy alta | 3 | HU-10, HU-11 | 2 | Nicolay Baquero |
| HU-13 | Administrar categorías desde frontend | Muy alta | 5 | HU-03, HU-07 | 2 | Santiago Cifuentes |
| HU-14 | Administrar productos desde frontend | Muy alta | 8 | HU-05, HU-07 | 2 | Nicolay Baquero |
| HU-15 | Implementar validaciones y actualización dinámica | Alta | 3 | HU-13, HU-14 | 2 | Santiago Cifuentes |
| HU-16 | Migrar estilos a SCSS | Alta | 5 | HU-07 | 2 | Nicolay Baquero |
| HU-17 | Configurar gestor de dependencias y scripts | Alta | 2 | HU-07 | 2 | Santiago Cifuentes |
| HU-18 | Implementar mitigación XSS | Muy alta | 3 | HU-13, HU-14 | 2 | Nicolay Baquero |
| HU-19 | Implementar protección CSRF | Muy alta | 5 | HU-03, HU-05 | 2 | Santiago Cifuentes |
| HU-20 | Configurar HTTPS | Muy alta | 3 | HU-01, HU-07 | 2 | Santiago Cifuentes |
| HU-21 | Integrar el sistema completo | Muy alta | 5 | HU-09, HU-12, HU-15, HU-18, HU-19, HU-20 | 3 | Nicolay Baquero |
| HU-22 | Ejecutar pruebas funcionales | Muy alta | 5 | HU-21 | 3 | Santiago Cifuentes |
| HU-23 | Validar seguridad | Muy alta | 3 | HU-18, HU-19, HU-20 | 3 | Santiago Cifuentes |
| HU-24 | Crear documentación técnica | Alta | 5 | HU-06, HU-21 | 3 | Nicolay Baquero |
| HU-25 | Desplegar aplicación | Muy alta | 8 | HU-21, HU-20 | 3 | Santiago Cifuentes |
| HU-26 | Corregir errores finales | Muy alta | 3 | HU-22, HU-23, HU-25 | 3 | Nicolay Baquero |
| HU-27 | Preparar sustentación | Alta | 3 | HU-24, HU-25, HU-26 | 3 | Nicolay Baquero |

**Total Product Backlog: 115 puntos.**

## 12. Detalle de Historias de Usuario

### HU-01 — Configurar backend y conexión a base de datos

**Descripción / Historia de usuario:** Como desarrollador, quiero disponer de la estructura inicial del backend y de una conexión funcional con la base de datos para poder almacenar la información de All In La PK.

**Prioridad:** Muy alta  
**Puntos:** 5  
**Dependencias:** Ninguna  
**Sprint:** 1  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- El servidor Express inicia correctamente.
- La aplicación establece conexión con MongoDB.
- Los parámetros sensibles de conexión no están escritos directamente en el código.
- Un error de conexión puede ser identificado mediante un mensaje controlado.

**Subtareas:**
- Crear proyecto backend.
- Instalar Express y dependencias necesarias.
- Crear estructura de carpetas.
- Configurar variables de entorno.
- Configurar conexión con MongoDB.
- Verificar inicio correcto del servidor.

### HU-02 — Crear modelo de categorías

**Descripción / Historia de usuario:** Como administrador, quiero almacenar categorías para organizar correctamente los artículos de póker de la tienda.

**Prioridad:** Muy alta  
**Puntos:** 3  
**Dependencias:** HU-01  
**Sprint:** 1  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Cada categoría posee un identificador único.
- Puede almacenarse nombre y descripción.
- El nombre de la categoría es obligatorio.
- La categoría queda almacenada persistentemente.

**Subtareas:**
- Definir esquema de categoría.
- Configurar campos obligatorios.
- Crear modelo.
- Probar creación directamente desde backend.

### HU-03 — CRUD REST de categorías

**Descripción / Historia de usuario:** Como administrador, quiero crear, consultar, editar y eliminar categorías para mantener organizado el catálogo.

**Prioridad:** Muy alta  
**Puntos:** 5  
**Dependencias:** HU-02  
**Sprint:** 1  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Es posible crear una categoría.
- Es posible listar categorías.
- Es posible actualizar una categoría existente.
- Es posible eliminar una categoría.
- Los cambios se reflejan en MongoDB.
- Los endpoints devuelven códigos HTTP apropiados.

**Subtareas:**
- Crear endpoint POST.
- Crear endpoint GET.
- Crear endpoint PUT/PATCH.
- Crear endpoint DELETE.
- Agregar validaciones.
- Probar endpoints.

### HU-04 — Crear modelo de productos

**Descripción / Historia de usuario:** Como administrador, quiero almacenar los productos de All In La PK junto con su categoría para gestionar el catálogo.

**Prioridad:** Muy alta  
**Puntos:** 3  
**Dependencias:** HU-01, HU-02  
**Sprint:** 1  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Cada producto tiene identificador único.
- Tiene nombre, descripción, precio, stock e imagen.
- Todo producto está asociado a una categoría.
- Precio y stock admiten únicamente valores válidos.

**Subtareas:**
- Diseñar esquema.
- Crear relación con categoría.
- Agregar validación de precio.
- Agregar validación de stock.
- Crear modelo de producto.

### HU-05 — CRUD REST de productos

**Descripción / Historia de usuario:** Como administrador, quiero administrar los productos mediante la API para mantener actualizado el catálogo.

**Prioridad:** Muy alta  
**Puntos:** 8  
**Dependencias:** HU-04  
**Sprint:** 1  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Puede crearse un producto.
- Puede consultarse uno o varios productos.
- Puede modificarse.
- Puede eliminarse.
- Cada producto conserva su asociación con una categoría.
- Los cambios quedan almacenados en la base de datos.

**Subtareas:**
- Crear POST de productos.
- Crear GET general.
- Crear GET individual.
- Crear PUT/PATCH.
- Crear DELETE.
- Agregar validaciones.
- Probar endpoints.

### HU-06 — Documentar API con Swagger/OpenAPI

**Descripción / Historia de usuario:** Como desarrollador externo, quiero consultar la documentación de la API para comprender y probar sus servicios sin revisar el código.

**Prioridad:** Alta  
**Puntos:** 3  
**Dependencias:** HU-03, HU-05  
**Sprint:** 1  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Swagger es accesible.
- Los endpoints de categorías están documentados.
- Los endpoints de productos están documentados.
- Se muestran parámetros, cuerpos y respuestas.
- Las operaciones pueden probarse desde Swagger.

**Subtareas:**
- Instalar/configurar Swagger.
- Documentar categorías.
- Documentar productos.
- Documentar respuestas HTTP.
- Verificar pruebas desde Swagger.

### HU-07 — Configurar frontend y comunicación con API

**Descripción / Historia de usuario:** Como desarrollador, quiero disponer de un frontend independiente conectado mediante API para construir la interfaz de la tienda.

**Prioridad:** Muy alta  
**Puntos:** 3  
**Dependencias:** Ninguna  
**Sprint:** 1  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- El frontend funciona como proyecto independiente.
- Puede realizar peticiones HTTP al backend.
- El backend no renderiza vistas.
- La estructura permite separar páginas, componentes y servicios.

**Subtareas:**
- Crear proyecto React.
- Instalar dependencias iniciales.
- Crear estructura.
- Configurar servicio de API.
- Comprobar comunicación frontend-backend.

### HU-08 — Visualizar catálogo público

**Descripción / Historia de usuario:** Como visitante, quiero visualizar los productos de All In La PK para conocer los artículos disponibles.

**Prioridad:** Muy alta  
**Puntos:** 5  
**Dependencias:** HU-05, HU-07  
**Sprint:** 1  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Los productos se obtienen desde la API.
- Se muestra información básica del producto.
- El visitante no necesita utilizar herramientas externas.
- La información se presenta desde el frontend.

**Subtareas:**
- Crear vista de catálogo.
- Consumir endpoint de productos.
- Crear componente de producto.
- Mostrar nombre, precio e imagen.
- Manejar estados de carga/error.

### HU-09 — Filtrar catálogo por categoría

**Descripción / Historia de usuario:** Como visitante, quiero seleccionar una categoría para visualizar únicamente los productos que pertenecen a ella.

**Prioridad:** Alta  
**Puntos:** 3  
**Dependencias:** HU-03, HU-08  
**Sprint:** 1  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Las categorías se cargan desde la API.
- El usuario puede seleccionar una.
- Solo aparecen productos de esa categoría.
- Puede volver a visualizar todos los productos.

**Subtareas:**
- Consumir categorías.
- Crear selector.
- Implementar filtrado.
- Validar resultados.

### HU-10 — Agregar productos al carrito

**Descripción / Historia de usuario:** Como cliente, quiero agregar productos al carrito para preparar mi compra.

**Prioridad:** Muy alta  
**Puntos:** 3  
**Dependencias:** HU-08  
**Sprint:** 2  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Existe una acción para agregar al carrito.
- El producto seleccionado aparece en el carrito.
- Agregar un producto actualiza el estado del carrito.
- No es necesario recargar la página.

**Subtareas:**
- Crear estructura del carrito.
- Implementar acción Agregar.
- Actualizar estado.
- Mostrar indicador del carrito.
- Probar diferentes productos.

### HU-11 — Gestionar cantidades y eliminar del carrito

**Descripción / Historia de usuario:** Como cliente, quiero modificar cantidades y eliminar productos para controlar los artículos seleccionados.

**Prioridad:** Muy alta  
**Puntos:** 5  
**Dependencias:** HU-10  
**Sprint:** 2  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Puede aumentarse la cantidad.
- Puede disminuirse.
- Puede eliminarse un producto.
- No se admiten cantidades inválidas.

**Subtareas:**
- Implementar aumento.
- Implementar disminución.
- Implementar eliminación.
- Validar cantidad mínima.
- Actualizar vista dinámicamente.

### HU-12 — Calcular total del carrito

**Descripción / Historia de usuario:** Como cliente, quiero visualizar el valor total de mi carrito para conocer cuánto cuestan los productos seleccionados.

**Prioridad:** Muy alta  
**Puntos:** 3  
**Dependencias:** HU-10, HU-11  
**Sprint:** 2  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Se calcula precio por cantidad.
- Se suman todos los subtotales.
- El total cambia al modificar cantidades.
- El total cambia al eliminar elementos.

**Subtareas:**
- Calcular subtotales.
- Calcular total.
- Conectar cálculo con cambios del carrito.
- Verificar diferentes escenarios.

### HU-13 — Administrar categorías desde frontend

**Descripción / Historia de usuario:** Como administrador, quiero gestionar categorías desde una interfaz gráfica para no depender de Postman.

**Prioridad:** Muy alta  
**Puntos:** 5  
**Dependencias:** HU-03, HU-07  
**Sprint:** 2  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Puede crear categorías.
- Puede visualizar categorías.
- Puede editarlas.
- Puede eliminarlas.
- Los cambios se reflejan sin recarga completa.

**Subtareas:**
- Crear vista administrativa.
- Crear formulario.
- Integrar POST.
- Integrar PUT/PATCH.
- Integrar DELETE.
- Actualizar lista dinámicamente.

### HU-14 — Administrar productos desde frontend

**Descripción / Historia de usuario:** Como administrador, quiero gestionar productos desde el panel para mantener actualizado el catálogo.

**Prioridad:** Muy alta  
**Puntos:** 8  
**Dependencias:** HU-05, HU-07  
**Sprint:** 2  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Puede registrar un producto desde la interfaz.
- Puede modificarlo.
- Puede eliminarlo.
- Puede asignarlo a una categoría.
- Puede registrar precio y stock.
- No necesita utilizar Postman.

**Subtareas:**
- Crear listado administrativo.
- Crear formulario.
- Integrar creación.
- Integrar edición.
- Integrar eliminación.
- Crear selector de categorías.
- Actualizar interfaz dinámicamente.

### HU-15 — Implementar validaciones y actualización dinámica

**Descripción / Historia de usuario:** Como usuario, quiero recibir mensajes claros ante información incorrecta y visualizar los cambios sin recargar la página.

**Prioridad:** Alta  
**Puntos:** 3  
**Dependencias:** HU-13, HU-14  
**Sprint:** 2  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Los campos requeridos son validados.
- Precio y stock no admiten valores inválidos.
- Se muestran mensajes comprensibles.
- Una operación exitosa actualiza la interfaz inmediatamente.

**Subtareas:**
- Validar formularios.
- Validar precio.
- Validar stock.
- Crear mensajes de error.
- Crear mensajes de éxito.
- Actualizar estado después del CRUD.

### HU-16 — Migrar estilos a SCSS

**Descripción / Historia de usuario:** Como desarrollador, quiero utilizar SCSS para mantener organizados los estilos del frontend.

**Prioridad:** Alta  
**Puntos:** 5  
**Dependencias:** HU-07  
**Sprint:** 2  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- SCSS está configurado.
- Las vistas utilizan archivos SCSS.
- Se utilizan características propias del preprocesador.
- Los estilos se compilan correctamente.

**Subtareas:**
- Instalar/configurar Sass.
- Crear estructura SCSS.
- Definir variables.
- Migrar estilos.
- Comprobar compilación.

### HU-17 — Configurar gestor de dependencias y scripts

**Descripción / Historia de usuario:** Como desarrollador, quiero gestionar dependencias y tareas mediante npm para facilitar el mantenimiento y ejecución del frontend.

**Prioridad:** Alta  
**Puntos:** 2  
**Dependencias:** HU-07  
**Sprint:** 2  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Las dependencias aparecen correctamente declaradas.
- Existen scripts para ejecutar el proyecto.
- Otro integrante puede instalar dependencias con npm.
- El proyecto funciona después de una instalación limpia.

**Subtareas:**
- Revisar package.json.
- Organizar dependencias.
- Definir scripts.
- Probar npm install.
- Documentar comandos.

### HU-18 — Implementar mitigación XSS

**Descripción / Historia de usuario:** Como usuario, quiero que la aplicación controle contenido potencialmente malicioso para reducir riesgos de XSS.

**Prioridad:** Muy alta  
**Puntos:** 3  
**Dependencias:** HU-13, HU-14  
**Sprint:** 2  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Las entradas no ejecutan scripts introducidos por usuarios.
- La información ingresada es tratada de forma segura.
- Existe un caso demostrable de mitigación XSS.

**Subtareas:**
- Identificar entradas vulnerables.
- Implementar controles.
- Probar entradas maliciosas.
- Documentar caso de prueba.

### HU-19 — Implementar protección CSRF

**Descripción / Historia de usuario:** Como administrador, quiero proteger las operaciones que modifican datos contra solicitudes CSRF.

**Prioridad:** Muy alta  
**Puntos:** 5  
**Dependencias:** HU-03, HU-05  
**Sprint:** 2  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Las operaciones modificadoras cuentan con protección CSRF.
- Una solicitud inválida puede rechazarse.
- Las solicitudes legítimas siguen funcionando.
- Existe un caso demostrable.

**Subtareas:**
- Configurar mecanismo CSRF.
- Proteger POST.
- Proteger PUT/PATCH.
- Proteger DELETE.
- Adaptar frontend.
- Crear prueba demostrable.

### HU-20 — Configurar HTTPS

**Descripción / Historia de usuario:** Como usuario, quiero acceder a la aplicación mediante HTTPS para proteger la comunicación con el sistema.

**Prioridad:** Muy alta  
**Puntos:** 3  
**Dependencias:** HU-01, HU-07  
**Sprint:** 2  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- La aplicación puede accederse mediante HTTPS.
- La comunicación segura funciona correctamente.
- HTTPS puede demostrarse durante la sustentación.

**Subtareas:**
- Definir estrategia HTTPS.
- Configurar certificado/entorno.
- Adaptar URLs.
- Probar comunicación.
- Documentar evidencia.

### HU-21 — Integrar el sistema completo

**Descripción / Historia de usuario:** Como equipo, queremos integrar todos los módulos para comprobar que All In La PK funciona como una sola aplicación.

**Prioridad:** Muy alta  
**Puntos:** 5  
**Dependencias:** HU-09, HU-12, HU-15, HU-18, HU-19, HU-20  
**Sprint:** 3  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- El catálogo consume datos reales.
- El carrito funciona.
- El panel administrativo funciona.
- El CRUD actualiza la base de datos y el frontend.
- No existen fallos bloqueantes de integración.

**Subtareas:**
- Integrar frontend/backend.
- Revisar rutas.
- Revisar API.
- Revisar carrito.
- Revisar administrador.
- Corregir conflictos iniciales.

### HU-22 — Ejecutar pruebas funcionales

**Descripción / Historia de usuario:** Como equipo, queremos probar las funciones principales para comprobar el cumplimiento de los requisitos.

**Prioridad:** Muy alta  
**Puntos:** 5  
**Dependencias:** HU-21  
**Sprint:** 3  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- El CRUD de categorías es probado.
- El CRUD de productos es probado.
- El catálogo es probado.
- El filtrado es probado.
- El carrito es probado.
- El panel administrativo es probado.

**Subtareas:**
- Diseñar casos de prueba.
- Probar categorías.
- Probar productos.
- Probar catálogo.
- Probar carrito.
- Probar panel.
- Registrar resultados.

### HU-23 — Validar seguridad

**Descripción / Historia de usuario:** Como equipo, queremos comprobar las medidas de seguridad para poder demostrarlas durante la sustentación.

**Prioridad:** Muy alta  
**Puntos:** 3  
**Dependencias:** HU-18, HU-19, HU-20  
**Sprint:** 3  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- Existe evidencia de HTTPS.
- Existe caso demostrable de XSS.
- Existe caso demostrable de CSRF.
- Los tres pueden explicarse durante la sustentación.

**Subtareas:**
- Ejecutar prueba HTTPS.
- Ejecutar prueba XSS.
- Ejecutar prueba CSRF.
- Capturar evidencias.
- Documentar procedimiento.

### HU-24 — Crear documentación técnica

**Descripción / Historia de usuario:** Como desarrollador, quiero disponer de documentación técnica para que el proyecto pueda comprenderse, instalarse y ejecutarse correctamente.

**Prioridad:** Alta  
**Puntos:** 5  
**Dependencias:** HU-06, HU-21  
**Sprint:** 3  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Se explica arquitectura.
- Se explica frontend.
- Se explica backend.
- Se explica base de datos.
- Se incluyen instrucciones de instalación.
- Se incluyen instrucciones de ejecución.
- Swagger permanece disponible.

**Subtareas:**
- Crear README.
- Documentar arquitectura.
- Documentar estructura del backend.
- Documentar frontend.
- Documentar variables de entorno.
- Documentar ejecución.

### HU-25 — Desplegar aplicación

**Descripción / Historia de usuario:** Como visitante, quiero acceder a All In La PK sin depender del computador de un integrante.

**Prioridad:** Muy alta  
**Puntos:** 8  
**Dependencias:** HU-21, HU-20  
**Sprint:** 3  
**Responsable:** Santiago Cifuentes

**Criterios de aceptación:**
- El frontend está disponible externamente.
- El backend está disponible externamente.
- La aplicación puede conectarse a la base de datos.
- Un tercero puede abrirla y probarla.
- No depende del computador personal de Nicolay Baquero o Santiago Cifuentes.

**Subtareas:**
- Seleccionar entorno de despliegue.
- Configurar backend.
- Configurar frontend.
- Configurar variables.
- Configurar base de datos.
- Verificar HTTPS.
- Realizar prueba desde otro equipo.

### HU-26 — Corregir errores finales

**Descripción / Historia de usuario:** Como equipo, queremos corregir los errores encontrados durante las pruebas para entregar una versión estable.

**Prioridad:** Muy alta  
**Puntos:** 3  
**Dependencias:** HU-22, HU-23, HU-25  
**Sprint:** 3  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Los errores bloqueantes están corregidos.
- Los casos críticos vuelven a ejecutarse correctamente.
- No quedan fallos que impidan la demostración.

**Subtareas:**
- Crear lista de errores.
- Clasificar por prioridad.
- Corregir errores críticos.
- Ejecutar regresión.
- Cerrar incidencias.

### HU-27 — Preparar sustentación

**Descripción / Historia de usuario:** Como equipo, queremos preparar la demostración final para evidenciar que el proyecto cumple los requisitos del examen.

**Prioridad:** Alta  
**Puntos:** 3  
**Dependencias:** HU-24, HU-25, HU-26  
**Sprint:** 3  
**Responsable:** Nicolay Baquero

**Criterios de aceptación:**
- Se puede demostrar el CRUD.
- Se demuestra catálogo por categoría.
- Se demuestra carrito.
- Se demuestra panel administrativo.
- Se demuestra Swagger.
- Se demuestran HTTPS, XSS y CSRF.
- La aplicación está accesible.

**Subtareas:**
- Definir orden de demostración.
- Preparar datos de prueba.
- Dividir exposición.
- Ensayar seguridad.
- Ensayar funcionamiento.
- Verificar despliegue antes de sustentar.

## 13. Sprint Backlogs

### Sprint 1

**Sprint Goal:** Construir la base tecnológica de All In La PK, dejando operativos la base de datos, API REST, CRUD de productos y categorías, Swagger y catálogo público.

| HU | Actividad | Responsable | Puntos | Dependencias |
|---|---|---|---:|---|
| HU-01 | Configurar backend y conexión a base de datos | Nicolay Baquero | 5 | Ninguna |
| HU-02 | Crear modelo de categorías | Santiago Cifuentes | 3 | HU-01 |
| HU-03 | CRUD REST de categorías | Santiago Cifuentes | 5 | HU-02 |
| HU-04 | Crear modelo de productos | Nicolay Baquero | 3 | HU-01, HU-02 |
| HU-05 | CRUD REST de productos | Nicolay Baquero | 8 | HU-04 |
| HU-06 | Documentar API con Swagger/OpenAPI | Santiago Cifuentes | 3 | HU-03, HU-05 |
| HU-07 | Configurar frontend y comunicación con API | Santiago Cifuentes | 3 | Ninguna |
| HU-08 | Visualizar catálogo público | Santiago Cifuentes | 5 | HU-05, HU-07 |
| HU-09 | Filtrar catálogo por categoría | Nicolay Baquero | 3 | HU-03, HU-08 |

**Carga Nicolay Baquero:** 19 puntos  
**Carga Santiago Cifuentes:** 19 puntos  
**Total Sprint 1:** 38 puntos

### Sprint 2

**Sprint Goal:** Completar las funcionalidades de compra y administración de All In La PK e incorporar los requisitos de seguridad y frontend exigidos por el examen.

| HU | Actividad | Responsable | Puntos | Dependencias |
|---|---|---|---:|---|
| HU-10 | Agregar productos al carrito | Nicolay Baquero | 3 | HU-08 |
| HU-11 | Gestionar cantidades y eliminar del carrito | Santiago Cifuentes | 5 | HU-10 |
| HU-12 | Calcular total del carrito | Nicolay Baquero | 3 | HU-10, HU-11 |
| HU-13 | Administrar categorías desde frontend | Santiago Cifuentes | 5 | HU-03, HU-07 |
| HU-14 | Administrar productos desde frontend | Nicolay Baquero | 8 | HU-05, HU-07 |
| HU-15 | Implementar validaciones y actualización dinámica | Santiago Cifuentes | 3 | HU-13, HU-14 |
| HU-16 | Migrar estilos a SCSS | Nicolay Baquero | 5 | HU-07 |
| HU-17 | Configurar gestor de dependencias y scripts | Santiago Cifuentes | 2 | HU-07 |
| HU-18 | Implementar mitigación XSS | Nicolay Baquero | 3 | HU-13, HU-14 |
| HU-19 | Implementar protección CSRF | Santiago Cifuentes | 5 | HU-03, HU-05 |
| HU-20 | Configurar HTTPS | Santiago Cifuentes | 3 | HU-01, HU-07 |

**Carga Nicolay Baquero:** 22 puntos  
**Carga Santiago Cifuentes:** 23 puntos  
**Total Sprint 2:** 45 puntos

### Sprint 3

**Sprint Goal:** Integrar, probar, documentar, desplegar y estabilizar All In La PK para realizar la entrega y sustentación final.

| HU | Actividad | Responsable | Puntos | Dependencias |
|---|---|---|---:|---|
| HU-21 | Integrar el sistema completo | Nicolay Baquero | 5 | HU-09, HU-12, HU-15, HU-18, HU-19, HU-20 |
| HU-22 | Ejecutar pruebas funcionales | Santiago Cifuentes | 5 | HU-21 |
| HU-23 | Validar seguridad | Santiago Cifuentes | 3 | HU-18, HU-19, HU-20 |
| HU-24 | Crear documentación técnica | Nicolay Baquero | 5 | HU-06, HU-21 |
| HU-25 | Desplegar aplicación | Santiago Cifuentes | 8 | HU-21, HU-20 |
| HU-26 | Corregir errores finales | Nicolay Baquero | 3 | HU-22, HU-23, HU-25 |
| HU-27 | Preparar sustentación | Nicolay Baquero | 3 | HU-24, HU-25, HU-26 |

**Carga Nicolay Baquero:** 16 puntos  
**Carga Santiago Cifuentes:** 16 puntos  
**Total Sprint 3:** 32 puntos

## 14. Resumen de carga

| Sprint | Nicolay Baquero | Santiago Cifuentes | Total |
|---|---:|---:|---:|
| Sprint 1 | 19 | 19 | 38 |
| Sprint 2 | 22 | 23 | 45 |
| Sprint 3 | 16 | 16 | 32 |
| **Total** | **57** | **58** | **115** |

La distribución global queda equilibrada: 57 puntos para Nicolay Baquero y 58 puntos para Santiago Cifuentes.
