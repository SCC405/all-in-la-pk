import { NavLink } from 'react-router-dom';

const enlaces = [
  { a: '/', texto: 'Catálogo' },
  { a: '/admin', texto: 'Administración' },
];

export default function Navbar() {
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
