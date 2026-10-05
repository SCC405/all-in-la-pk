# Despliegue de All In La PK

Guía para publicar la aplicación en Render, de modo que cualquiera pueda usarla sin
depender del computador de Nicolay ni de Chifu (RNF-15 y RNF-16).

## Qué se despliega

Dos servicios **independientes**, como exige RNF-01:

| Servicio | Qué es | Carpeta |
|---|---|---|
| `all-in-la-pk-api` | Servicio Node con la API REST | `backend/` |
| `all-in-la-pk-web` | Sitio estático con la tienda | `frontend/` |

La base de datos es **MongoDB Atlas**, que ya existe y no se despliega aquí.

Render emite y renueva el certificado TLS de cada servicio, así que el backend **no necesita
certificados propios**: recibe el tráfico ya descifrado detrás del proxy de Render. Los
certificados autofirmados de `npm run certificados` son solo para desarrollo.

## Antes de empezar

1. Una cuenta en [render.com](https://render.com) (el plan gratuito basta).
2. La cadena de conexión de MongoDB Atlas, terminada en `/all_in_la_pk`.
3. En Atlas → **Network Access**, permitir la conexión desde Render. El plan gratuito de
   Render no da IP fija, así que hay que permitir `0.0.0.0/0`. **Es imprescindible**: sin
   esto el backend arranca pero no conecta, y el síntoma es un error de conexión genérico
   que despista.

## Pasos

### 1. Crear los servicios

En Render: **New → Blueprint**, apuntar a este repositorio y elegir la rama `main`.
Render lee [`render.yaml`](../render.yaml) y crea los dos servicios con casi toda la
configuración ya puesta.

### 2. Rellenar las tres variables que faltan

El blueprint deja tres a propósito, para que ningún secreto ni URL quede escrito en el
repositorio:

| Servicio | Variable | Valor |
|---|---|---|
| api | `MONGODB_URI` | La cadena de Atlas, terminada en `/all_in_la_pk` |
| api | `CORS_ORIGIN` | La URL del sitio web, p. ej. `https://all-in-la-pk-web.onrender.com` |
| web | `VITE_API_URL` | La URL de la api **con `/api`**, p. ej. `https://all-in-la-pk-api.onrender.com/api` |

Las URLs no se conocen hasta que Render crea los servicios, así que el orden es: crear →
copiar las URLs → rellenar → volver a desplegar.

> `CSRF_SECRET` lo genera Render solo. No hay que tocarlo, pero **tampoco borrarlo**: sin un
> secreto fijo cada reinicio invalidaría los tokens ya emitidos.

### 3. Volver a desplegar el frontend

Vite incrusta `VITE_API_URL` **en el momento de compilar**, no al arrancar. Después de
rellenarla hay que lanzar un *Manual Deploy* del sitio web; reiniciarlo no sirve de nada.

Es el error más fácil de cometer: el síntoma es que la tienda carga pero no muestra productos,
y en la consola del navegador aparecen peticiones a `localhost:4000`.

### 4. Sembrar datos (opcional)

Con la cadena de Atlas en el `.env` local:

```bash
npm run sembrar --prefix backend
```

## Comprobaciones

| Qué | Cómo |
|---|---|
| La API responde | `https://…-api.onrender.com/api/health` → `{"status":"ok"}` |
| Swagger funciona | `https://…-api.onrender.com/api-docs` |
| La tienda carga productos | Abrir la URL del sitio y ver el catálogo |
| HTTPS real | Candado en el navegador, **sin advertencia de certificado** |
| El panel guarda | Crear una categoría desde `/admin` |

Esa última prueba es la que de verdad valida el despliegue: ejercita CORS entre dominios,
la cookie CSRF y la escritura en Atlas de una sola vez.

## Por qué está configurado así

### `TRUST_PROXY=true`

Detrás del proxy de Render, Express necesita permiso explícito para leer `X-Forwarded-Proto`
y saber si la petición original venía cifrada. **Sin esto la redirección a HTTPS entra en
bucle**: el proxy descifra, Express cree que llegó sin cifrar y redirige, y vuelta a empezar.

Solo se activa aquí. Si estuviera activo siempre, cualquier cliente podría enviar esa
cabecera a mano y hacerse pasar por una conexión segura.

### `FORZAR_HTTPS=true`

Dos efectos: redirige lo que llegue sin cifrar y envía `Strict-Transport-Security`; y hace que
la cookie del token CSRF salga como `SameSite=None; Secure`, **imprescindible porque el
frontend vive en otro dominio**. Comprobado:

```
produccion:   XSRF-TOKEN=…; Path=/; Secure; SameSite=None
desarrollo:   XSRF-TOKEN=…; Path=/; SameSite=Lax
```

### La comprobación de salud está exenta de la redirección

El proveedor puede consultar `/api/health` por dentro, sin pasar por el proxy. Si la
redirigiéramos recibiría un `308` en lugar de un `200` y daría el servicio por caído.

Se detectó simulando la configuración de producción en local antes de desplegar; hay una
prueba que lo fija.

### La regla de reescritura del sitio estático

La tienda usa rutas del lado del cliente (`/` y `/admin`). Sin la regla que manda todo a
`index.html`, entrar directo a `/admin` o recargar estando ahí devolvería un `404`.

## Problemas frecuentes

| Síntoma | Causa |
|---|---|
| La tienda carga pero sin productos, y la consola pide a `localhost:4000` | Falta volver a **compilar** el frontend tras poner `VITE_API_URL` |
| El panel no guarda y responde `403` | `CORS_ORIGIN` no coincide exactamente con la URL del sitio: sobra una barra final o es `http` en vez de `https` |
| La API arranca pero no conecta | Falta permitir `0.0.0.0/0` en Network Access de Atlas |
| La primera petición tarda mucho | El plan gratuito duerme el servicio tras inactividad. Conviene abrir la aplicación unos minutos antes de la sustentación |
