import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '../context/SesionContext.jsx';

/**
 * Entrar o salir, según haya sesión.
 *
 * Mientras se comprueba la cookie no se dibuja nada: enseñar «Entrar» y
 * cambiarlo a «Salir» medio segundo después es peor que esperar.
 */
export default function BotonSesion() {
  const { activa, comprobando, salir, usuario } = useSesion();
  const [saliendo, setSaliendo] = useState(false);
  const navegar = useNavigate();
  const ubicacion = useLocation();

  if (comprobando) return null;

  if (!activa) {
    // En /login no hace falta ofrecer ir a /login.
    if (ubicacion.pathname === '/login') return null;

    return (
      <Link className="boton boton--secundario" to="/login">
        Entrar
      </Link>
    );
  }

  async function cerrar() {
    setSaliendo(true);

    // Se sale del panel ANTES de cerrar la sesión. Al revés, RutaProtegida
    // reacciona al cambio y manda a /login, que no es donde quiere ir quien
    // acaba de pulsar «Salir»: quiere volver a la tienda.
    navegar('/', { replace: true });

    try {
      await salir();
    } finally {
      setSaliendo(false);
    }
  }

  return (
    <div className="sesion">
      <span className="sesion__usuario">
        <span className="visualmente-oculto">Sesión iniciada como </span>
        {usuario}
      </span>
      <button
        className="boton boton--secundario"
        type="button"
        onClick={cerrar}
        disabled={saliendo}
      >
        {saliendo ? 'Saliendo…' : 'Salir'}
      </button>
    </div>
  );
}
