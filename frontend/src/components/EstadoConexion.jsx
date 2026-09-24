import { useEffect, useState } from 'react';
import { api, ErrorApi, URL_BASE } from '../services/apiCliente.js';

// Comprueba que el frontend puede hablar con la API REST del backend.
// Es la evidencia viva del último criterio de aceptación de HU-07.
export default function EstadoConexion() {
  const [estado, setEstado] = useState({ tipo: 'consultando' });

  useEffect(() => {
    let vigente = true;

    api
      .get('/categorias')
      .then((categorias) => {
        if (!vigente) return;
        setEstado({ tipo: 'conectado', total: Array.isArray(categorias) ? categorias.length : 0 });
      })
      .catch((error) => {
        if (!vigente) return;
        if (error instanceof ErrorApi && error.estado === 0) {
          setEstado({ tipo: 'sin-servidor' });
        } else if (error instanceof ErrorApi && error.estado === 404) {
          // El servidor responde, pero el CRUD de categorías aún no existe (HU-03).
          setEstado({ tipo: 'servidor-sin-ruta' });
        } else {
          setEstado({ tipo: 'error', mensaje: error.message });
        }
      });

    return () => {
      vigente = false;
    };
  }, []);

  const mensajes = {
    consultando: ['neutro', 'Consultando la API…'],
    conectado: ['ok', `Conectado a la API · ${estado.total} categoría(s) registradas`],
    'servidor-sin-ruta': ['aviso', 'El servidor responde, pero /categorias aún no existe (pendiente HU-03)'],
    'sin-servidor': ['error', 'Sin respuesta del backend. ¿Está corriendo en otra terminal?'],
    error: ['error', estado.mensaje],
  };

  const [nivel, texto] = mensajes[estado.tipo];

  return (
    <div className={`estado estado--${nivel}`}>
      <p className="estado__texto">{texto}</p>
      <p className="estado__url">{URL_BASE}</p>
    </div>
  );
}
