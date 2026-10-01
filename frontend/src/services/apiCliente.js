// Cliente HTTP compartido para hablar con la API REST de All In La PK.
// Toda la comunicación con el backend pasa por aquí (RNF-02).

const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const METODOS_QUE_MODIFICAN = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ErrorApi extends Error {
  constructor(mensaje, estado, detalles) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.detalles = detalles;
  }
}

// El token se guarda en memoria, no se lee de la cookie.
//
// En desarrollo se podría leer con document.cookie, porque las cookies ignoran
// el puerto y localhost:5173 ve la que puso localhost:4000. Pero desplegados en
// dominios distintos eso deja de funcionar, así que se toma del cuerpo de la
// respuesta, que sí llega siempre. La cookie viaja sola gracias a `credentials`.
let tokenCsrf = null;

async function obtenerTokenCsrf() {
  const respuesta = await fetch(`${URL_BASE}/csrf-token`, { credentials: 'include' });

  if (!respuesta.ok) {
    throw new ErrorApi('No se pudo obtener el token de seguridad.', respuesta.status);
  }

  tokenCsrf = (await respuesta.json()).csrfToken;
  return tokenCsrf;
}

async function enviar(ruta, opciones, cabeceras) {
  try {
    return await fetch(`${URL_BASE}${ruta}`, {
      ...opciones,
      headers: cabeceras,
      // Necesario para que viaje la cookie del token CSRF, también entre dominios.
      credentials: 'include',
    });
  } catch {
    // El servidor no respondió: backend apagado, sin red o CORS bloqueado.
    throw new ErrorApi('No se pudo conectar con el servidor de All In La PK.', 0);
  }
}

async function peticion(ruta, opciones = {}) {
  const metodo = (opciones.method ?? 'GET').toUpperCase();
  const modifica = METODOS_QUE_MODIFICAN.has(metodo);

  // Content-Type solo cuando hay cuerpo: enviarlo en un GET convierte la petición
  // en "no simple" y obliga al navegador a un preflight CORS en cada lectura.
  const cabeceras = { ...opciones.headers };
  if (opciones.body) cabeceras['Content-Type'] = 'application/json';

  if (modifica) {
    cabeceras['X-CSRF-Token'] = tokenCsrf ?? (await obtenerTokenCsrf());
  }

  let respuesta = await enviar(ruta, opciones, cabeceras);

  // Un 403 en una mutación suele significar que el token caducó porque el
  // servidor se reinició. Se pide uno nuevo y se reintenta una sola vez, para
  // que el administrador no tenga que recargar la página.
  if (modifica && respuesta.status === 403) {
    cabeceras['X-CSRF-Token'] = await obtenerTokenCsrf();
    respuesta = await enviar(ruta, opciones, cabeceras);
  }

  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // El backend responde { error, detalles? }: `detalles` trae el mensaje por
    // campo cuando la validación del esquema rechaza el formulario.
    throw new ErrorApi(
      cuerpo?.error ?? `La API respondió con el estado ${respuesta.status}.`,
      respuesta.status,
      cuerpo?.detalles,
    );
  }

  return cuerpo;
}

export const api = {
  get: (ruta) => peticion(ruta),
  post: (ruta, datos) => peticion(ruta, { method: 'POST', body: JSON.stringify(datos) }),
  put: (ruta, datos) => peticion(ruta, { method: 'PUT', body: JSON.stringify(datos) }),
  delete: (ruta) => peticion(ruta, { method: 'DELETE' }),
};

export { URL_BASE };
