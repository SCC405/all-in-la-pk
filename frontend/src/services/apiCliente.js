// Cliente HTTP compartido para hablar con la API REST de All In La PK.
// Toda la comunicación con el backend pasa por aquí (RNF-02).

const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
  }
}

async function peticion(ruta, opciones = {}) {
  let respuesta;

  // Content-Type solo cuando hay cuerpo: enviarlo en un GET convierte la petición
  // en "no simple" y obliga al navegador a un preflight CORS en cada lectura.
  const cabeceras = { ...opciones.headers };
  if (opciones.body) cabeceras['Content-Type'] = 'application/json';

  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      ...opciones,
      headers: cabeceras,
    });
  } catch {
    // El servidor no respondió: backend apagado, sin red o CORS bloqueado.
    throw new ErrorApi('No se pudo conectar con el servidor de All In La PK.', 0);
  }

  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new ErrorApi(
      cuerpo?.mensaje ?? `La API respondió con el estado ${respuesta.status}.`,
      respuesta.status,
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
