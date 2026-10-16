# Evidencia de seguridad — All In La PK

Material para **HU-23 (Validar seguridad)** y para el paso 6 de la demostración.

Los tres casos son **reproducibles**: se pueden ejecutar delante del profesor. Todas
las salidas de este documento se capturaron contra producción el 15 de octubre de
2026, salvo donde se indique.

```
API     https://all-in-la-pk-api.onrender.com
Tienda  https://all-in-la-pk-web.onrender.com
```

> **Antes de demostrar nada, calentad las dos URL.** El plan gratuito de Render
> duerme los servicios y la primera petición tarda cerca de un minuto. Una
> demostración que empieza con treinta segundos de silencio se juzga sola.

---

## 1. HTTPS

### Qué protege

Que nadie pueda leer ni alterar lo que viaja entre el navegador y la API: la cookie
de sesión, el token CSRF y los datos del formulario de compra.

### Demostración

**a) Todo lo que llega sin cifrar se redirige.**

```bash
curl -I http://all-in-la-pk-api.onrender.com/api/categorias
```

```
HTTP/1.1 301 Moved Permanently
Location: https://all-in-la-pk-api.onrender.com/api/categorias
```

**b) Sobre conexión cifrada se anuncia HSTS.**

```bash
curl -sI https://all-in-la-pk-api.onrender.com/api/categorias | grep -i strict
```

```
strict-transport-security: max-age=31536000; includeSubDomains
```

Un año, que es lo que recomienda OWASP. Le dice al navegador que durante ese tiempo
no vuelva a intentar `http` con este dominio, ni siquiera la primera petición.

**c) El certificado es real y está vigente.**

```bash
echo | openssl s_client -connect all-in-la-pk-api.onrender.com:443 \
  -servername all-in-la-pk-api.onrender.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

```
subject=CN=onrender.com
issuer=C=US, O=Google Trust Services, CN=WE1
notBefore=Sep 21 22:04:31 2026 GMT
notAfter=Dec 20 23:04:28 2026 GMT
```

### El detalle que conviene saber explicar

**La redirección de producción es un `301` de Render, no nuestro `308`.**

Render termina TLS y redirige en su propio borde, antes de que la petición llegue a
Express. Nuestro middleware `forzar-https.js` redirige con `308` —que conserva el
método y el cuerpo, de modo que un `POST` redirigido sigue siendo `POST`— y actúa
como respaldo si algún día se despliega sin ese borde delante.

Si el profesor pregunta por qué el código dice 308 y la salida dice 301, esa es la
respuesta. Se puede enseñar el nuestro levantando el backend en local con
`FORZAR_HTTPS=true`.

**`/api/health` está exento de la redirección, pero no de HSTS.**

```bash
curl -sI https://all-in-la-pk-api.onrender.com/api/health | grep -i strict
```

```
strict-transport-security: max-age=31536000; includeSubDomains
```

La exención existe porque Render consulta la salud por dentro, sin pasar por el
proxy. Con un `308` la comprobación pasaría **sin haber tocado la aplicación**:
estaría verificando que el redirector funciona, no que la API responde. Lo que se
salta es la redirección, no la cabecera — eso fue el bug #70, ya corregido.

---

## 2. XSS

### Qué protege

Que un texto guardado en la base —el nombre de un producto, una descripción— no se
ejecute como código al mostrarlo en el navegador de quien visita la tienda.

### Demostración en vivo, desde el panel

1. Entrar en `/login` y después en **Administración**.
2. Crear una categoría con este nombre, copiado tal cual:

   ```
   <script>alert('XSS')</script>
   ```

3. Ir al catálogo.

**Qué se ve:** el texto aparece **literalmente**, con sus `<` y `>` visibles, en el
selector de filtro y en la tarjeta. **No salta ninguna ventana.**

4. Abrir las herramientas del navegador e inspeccionar ese elemento.

**Qué se ve:** React escribió `&lt;script&gt;` en el HTML. El navegador nunca lo
trató como una etiqueta.

5. Borrar la categoría de prueba al terminar.

### Por qué funciona

**React escapa por defecto todo lo que se interpola.** La única forma de saltárselo
es pedirlo explícitamente, y en este proyecto no se pide en ningún sitio. Hay una
prueba automática que lo vigila:

```
✔ el frontend no contiene puntos de inyección que omitan el escape de React
```

Busca en todo `frontend/src` siete patrones: `dangerouslySetInnerHTML`,
`.innerHTML =`, `.outerHTML =`, `insertAdjacentHTML(`, `document.write(`, `eval(` y
`new Function(`. Si alguien añade cualquiera de ellos, la prueba falla.

> **Cuidado con una trampa.** Si alguien busca `dangerouslySetInnerHTML` dentro del
> JavaScript ya compilado, **lo encuentra cuatro veces**. No es nuestro: es del
> propio React, que necesita reconocer esa propiedad para implementarla. En nuestro
> código fuente aparece **cero veces**, y eso es lo que comprueba la prueba.

### La segunda capa: el único campo que acaba en HTML

El nombre y la descripción se muestran como texto. La **dirección de la imagen**, en
cambio, acaba en el atributo `src` de un `<img>`, y ahí un `javascript:` sí sería
ejecutable. Por eso se valida el protocolo en los dos lados:

- En el servidor, en el esquema de Mongoose (`esUrlHttpSegura`).
- En el navegador, antes de pintar (`normalizarUrlHttp`).

Solo se aceptan `http:` y `https:`. Se rechazan `javascript:`, `data:` y cualquier
otro esquema con contenido activo.

**Demostración:** en el formulario de producto, escribir como dirección de imagen
`javascript:alert(1)` y guardar. El formulario lo rechaza con el mensaje
«La dirección de la imagen debe ser una URL válida con http o https.» Y si se saltara
el formulario llamando a la API, el esquema lo rechazaría igual.

Pruebas que lo respaldan:

```
✔ las URL de recursos solo admiten los protocolos http y https        (frontend)
✔ la imagen solo acepta direcciones absolutas con http o https        (backend)
✔ el contenido con etiquetas se conserva como texto para que React
  lo escape al mostrarlo                                              (backend)
```

---

## 3. CSRF

### Qué protege

Que una página ajena no pueda hacer que **tu navegador**, con tu sesión ya abierta,
ejecute una operación en la tienda sin que lo sepas.

### Demostración, en cuatro escalones

Cada uno falla por un motivo distinto, y el mensaje lo dice. Es la parte más
demostrable de las tres.

**a) Sin token.**

```bash
curl -i -X POST https://all-in-la-pk-api.onrender.com/api/categorias \
  -H 'Content-Type: application/json' -d '{"nombre":"demostracion"}'
```

```
HTTP/1.1 403 Forbidden
{"error":"Falta el token CSRF. Solicita uno en GET /api/csrf-token y envíalo en la cabecera X-CSRF-Token."}
```

**b) Con la cabecera pero sin la cookie.** Un atacante puede hacer que el navegador
envíe la cookie, pero no puede leerla para copiarla a la cabecera.

```
HTTP/1.1 403 Forbidden
{"error":"Falta el token CSRF. …"}
```

**c) Con cookie y cabecera que coinciden, pero inventadas.** Este es el escalón que
demuestra que no basta con que los dos valores sean iguales:

```bash
curl -i -X POST https://all-in-la-pk-api.onrender.com/api/categorias \
  -H 'Content-Type: application/json' \
  -H 'X-CSRF-Token: inventado.falso' \
  -H 'Cookie: XSRF-TOKEN=inventado.falso' \
  -d '{"nombre":"demostracion"}'
```

```
HTTP/1.1 403 Forbidden
{"error":"Token CSRF inválido"}
```

Coinciden entre sí, y aun así se rechaza: **el token va firmado con HMAC-SHA256** y
la firma no cuadra. Sin el secreto del servidor no se puede fabricar uno válido.

**d) Con un token legítimo, pero desde otro origen.** Así es exactamente como
llegaría la petición desde una web atacante:

```bash
curl -i -X POST https://all-in-la-pk-api.onrender.com/api/categorias \
  -H 'Origin: https://sitio-atacante.example' \
  -H "X-CSRF-Token: $TOKEN" -b cookies.txt \
  -H 'Content-Type: application/json' -d '{"nombre":"demostracion"}'
```

```
HTTP/1.1 403 Forbidden
{"error":"Origen no permitido para esta operación"}
```

### Y después del CSRF, la sesión

Con token válido, cookie correcta y origen permitido, la petición **sigue sin pasar**
si no hay sesión de administrador:

```
HTTP/1.1 401 Unauthorized
{"error":"Necesitas iniciar sesión para esta operación. Entra en POST /api/sesion."}
```

**El orden importa y hay que saber decirlo: CSRF primero, sesión después.** Por eso
un `curl` a secas devuelve `403` y no `401`. No es un fallo: es que nunca llega a
comprobarse la sesión porque la petición se rechaza antes.

### Detalles que suman si preguntan

- **La cookie del CSRF no es `httpOnly`, y es correcto.** En el patrón de doble envío
  el frontend tiene que leerla para reenviarla en la cabecera. Precisamente por eso
  va firmada: que se pueda leer no permite falsificarla. Y una web atacante no puede
  leerla de todos modos, por la política del mismo origen.
- **La cookie de sesión sí es `httpOnly`.** A esa el frontend no necesita acceder, así
  que un XSS no podría robarla.
- **La comparación usa `timingSafeEqual`.** Una comparación normal tarda más cuanto
  más coincide, y eso filtra información a quien lo intenta a ciegas.
- **`GET`, `HEAD` y `OPTIONS` pasan sin token**, porque no modifican nada. Por eso el
  catálogo sigue siendo público.

---

## Resumen para la sustentación

| | Qué se demuestra | Cómo |
|---|---|---|
| **HTTPS** | Redirección, HSTS un año, certificado vigente | `curl -I` sobre `http` y `https` |
| **XSS** | Un `<script>` guardado se muestra como texto | Crear una categoría con él desde el panel |
| **CSRF** | Cuatro formas de intentarlo, cuatro rechazos distintos | `curl` con y sin token, firma y origen |

Y la frase que ata las tres:

> «El catálogo es público a propósito. Lo que está protegido es **modificarlo**, y
> hay dos cerrojos en serie: primero el CSRF, que impide que te engañen para hacer la
> petición, y después la sesión, que impide que la hagas tú sin permiso.»

---

## Lo que no está, y por qué

**No hay autenticación de clientes.** Comprar no exige registro, así que no hay
contraseñas de usuario que proteger. La única credencial del sistema es la del
administrador, guardada como hash `scrypt` con sal, nunca en claro.

**No hay pasarela de pago.** Está fuera del alcance declarado en el README. No se
piden, no se validan y no se guardan números de tarjeta, CVV ni fechas de caducidad.
Hay una prueba que vigila que ninguna forma de pago empiece a pedirlos.

**La auditoría de dependencias está en el PR #81.** `npm audit` reportaba cuatro
vulnerabilidades altas: una se corrigió y las otras tres están justificadas por
escrito —son de `nodemon`, una dependencia de desarrollo que nunca se ejecuta en
producción— porque el arreglo automático que proponía npm era peor que el problema.
