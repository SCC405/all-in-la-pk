import { NavLink } from 'react-router-dom';
import { useSesion } from '../context/SesionContext.jsx';

const ENLACE_CATALOGO = { a: '/', texto: 'Catálogo' };
const ENLACE_ADMIN = { a: '/admin', texto: 'Administración' };

export default function Navbar() {
  const { activa } = useSesion();

  // El enlace al panel solo aparece con sesión abierta. Quien no la tenga no
  // vería más que el catálogo, que es lo que puede usar de todas formas.
  const enlaces = activa ? [ENLACE_CATALOGO, ENLACE_ADMIN] : [ENLACE_CATALOGO];

  return (
    <nav className="navegacion" aria-label="Principal">
      <ul className="navegacion__lista">
        {enlaces.map(({ a, texto }) => (
          <li key={a}>
            <NavLink
              to={a}
              end={a === '/'}
              className={({ isActive }) =>
                `navegacion__enlace${isActive ? ' navegacion__enlace--activo' : ''}`
              }
            >
              {texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
