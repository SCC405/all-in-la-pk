import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../context/SesionContext.jsx';

/**
 * Deja pasar solo con sesión de administrador (HU-30).
 *
 * Esto NO es la protección: la de verdad está en la API, que responde 401 a
 * toda mutación sin sesión (HU-28). Aquí solo se evita enseñar una puerta que
 * no se puede abrir, y se manda al formulario a quien la intente.
 */
export default function RutaProtegida({ children }) {
  const { activa, comprobando } = useSesion();
  const ubicacion = useLocation();

  // Mientras se comprueba la cookie no se decide nada. Sin esto, la página
  // parpadearía: primero redirigiría a /login y luego volvería al panel.
  if (comprobando) {
    return (
      <p className="aviso" role="status">
        Comprobando la sesión…
      </p>
    );
  }

  if (!activa) {
    // `replace` para que el botón de atrás no devuelva a la página protegida,
    // y el destino para volver a ella una vez dentro.
    return <Navigate to="/login" replace state={{ destino: ubicacion.pathname }} />;
  }

  return children;
}
