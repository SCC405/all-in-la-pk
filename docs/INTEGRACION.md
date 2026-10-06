# Evidencia de integración — HU-21

**Fecha:** 5 de octubre de 2026  
**Responsable:** Nicolay Baquero  
**Entorno:** producción en Render

## Objetivo

Comprobar que frontend, backend, MongoDB Atlas y los módulos de catálogo, carrito y
administración funcionan como una sola aplicación, sin depender de los computadores del equipo.

## Entornos verificados

| Componente | Dirección |
|---|---|
| Tienda | <https://all-in-la-pk-web.onrender.com> |
| API | <https://all-in-la-pk-api.onrender.com> |
| Swagger | <https://all-in-la-pk-api.onrender.com/api-docs> |

## Resultado de los criterios de aceptación

| Criterio | Evidencia | Resultado |
|---|---|---|
| El catálogo consume datos reales | Renderizó 8 productos obtenidos desde la API de producción. | Cumple |
| El carrito funciona | Agregar dos unidades mostró cantidad 2, subtotal y total de `$ 36.000`; aumentar cambió ambos a `$ 54.000` y disminuir los devolvió a `$ 36.000`. | Cumple |
| El panel administrativo funciona | `/admin` cargó dos formularios, 6 categorías y 8 productos, sin errores ni advertencias en consola. | Cumple |
| El CRUD actualiza base y frontend | Se ejecutó el ciclo temporal descrito abajo; las lecturas confirmaron cada actualización. El panel consume las mismas rutas verificadas. | Cumple |
| No existen fallos bloqueantes | Catálogo, filtro, carrito, panel, API, CORS, CSRF y persistencia respondieron correctamente. | Cumple |

## Prueba de catálogo y carrito

1. El selector mostró todas las categorías almacenadas.
2. Al elegir **Cartas y barajas**, el catálogo pasó de 8 a 2 productos y conservó únicamente
   `Baraja Bicycle Rider Back` y `Baraja Copag 100% plástico`.
3. Se agregó dos veces la baraja Bicycle de `$ 18.000`.
4. El carrito mostró 2 unidades, subtotal `$ 36.000` y total `$ 36.000`.
5. El botón de aumento llevó la cantidad a 3 y el total a `$ 54.000`.
6. El botón de disminución la devolvió a 2 y el total a `$ 36.000`.
7. El producto agotado permaneció deshabilitado.

El carrito conservó sus datos al navegar de `/` a `/admin`, lo que confirma que el contexto se
comparte entre las vistas.

## Ciclo CRUD contra producción

Se utilizaron nombres con la marca `Integración HU-21` para distinguir los registros temporales.
La prueba se ejecutó mediante la API real con cookie y cabecera CSRF, enviando como `Origin` la
dirección del frontend desplegado.

| Operación | Resultado |
|---|---|
| Crear categoría | `201`, identificador generado |
| Actualizar categoría | Nombre y descripción persistidos |
| Crear producto asociado | `201`, categoría poblada en la respuesta |
| Actualizar producto | Stock `5` y precio `$ 25.000` persistidos |
| Intentar borrar la categoría con producto | `409`, protección contra producto huérfano |
| Eliminar producto temporal | `204` |
| Eliminar categoría temporal | `204` |
| Comprobar limpieza | 0 categorías y 0 productos temporales; producción volvió a 6 y 8 registros |

No se guardaron tokens, cookies, credenciales ni cadenas de conexión en esta evidencia.

## Verificación automatizada no destructiva

Desde la raíz del repositorio:

```bash
node scripts/verificar-integracion.mjs
```

El script comprueba frontend, health check, CORS, categorías, productos, relaciones pobladas,
HSTS y Swagger. Solo ejecuta lecturas, así que puede repetirse contra producción sin modificar
la base de datos. Las direcciones se pueden sustituir con `WEB_URL` y `API_ORIGIN`.

## Hallazgo de datos pendiente

Existe una sexta categoría llamada `Nicolay` con una descripción impropia y sin productos
asociados. No es un fallo de integración, pero debe eliminarse antes de la sustentación. Esta
HU no la borra porque no fue creada por su prueba automatizada.

## Conclusión

Los módulos funcionan integrados sobre la infraestructura real. La HU-21 queda técnicamente
cumplida; la promoción de `develop` a `main` debe realizarse después de integrar este documento.

