import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '../context/SesionContext.jsx';
import {
  destinoSeguro,
  hayErroresDeCredenciales,
  mensajeDeFallo,
  validarCredenciales,
} from '../utils/sesion.js';

const FORMULARIO_VACIO = { usuario: '', password: '' };

export default function Login() {
  const { activa, comprobando, entrar } = useSesion();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [fallo, setFallo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const campoUsuario = useRef(null);
  const campoPassword = useRef(null);

  // De dónde venía quien fue redirigido aquí, para devolverlo a su sitio.
  const destino = destinoSeguro(ubicacion.state?.destino);

  // Si ya hay sesión no tiene sentido enseñar el formulario: ni al entrar
  // directamente a /login, ni justo después de autenticarse.
  useEffect(() => {
    if (activa) navegar(destino, { replace: true });
  }, [activa, destino, navegar]);

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));

    // Al corregir un campo su error desaparece, igual que en el panel admin.
    setErrores((anteriores) => {
      if (!anteriores[name]) return anteriores;
      const { [name]: _, ...resto } = anteriores;
      return resto;
    });
  }

  async function enviar(evento) {
    evento.preventDefault();

    const encontrados = validarCredenciales(formulario);

    if (hayErroresDeCredenciales(encontrados)) {
      setErrores(encontrados);
      setFallo('');
      (encontrados.usuario ? campoUsuario : campoPassword).current?.focus();
      return;
    }

    setEnviando(true);
    setErrores({});
    setFallo('');

    try {
      await entrar(formulario);
      // La redirección la hace el efecto de arriba al cambiar `activa`.
    } catch (error) {
      setFallo(mensajeDeFallo(error));
      // Se borra solo la contraseña: rehacer el usuario a cada intento
      // molesta sin aportar nada.
      setFormulario((anterior) => ({ ...anterior, password: '' }));
      campoPassword.current?.focus();
    } finally {
      setEnviando(false);
    }
  }

  if (comprobando) {
    return (
      <p className="aviso" role="status">
        Comprobando la sesión…
      </p>
    );
  }

  return (
    <section className="acceso" aria-labelledby="titulo-acceso">
      <h1 className="acceso__titulo" id="titulo-acceso">
        Acceso de administración
      </h1>
      <p className="acceso__intro">
        El catálogo es público; para modificarlo hay que iniciar sesión.
      </p>

      <form className="formulario" onSubmit={enviar} noValidate>
        <div className="campo">
          <label className="campo__etiqueta" htmlFor="acceso-usuario">
            Usuario <span aria-hidden="true">*</span>
            <span className="visualmente-oculto">(obligatorio)</span>
          </label>
          <input
            className={`campo__control${errores.usuario ? ' campo__control--error' : ''}`}
            id="acceso-usuario"
            name="usuario"
            ref={campoUsuario}
            value={formulario.usuario}
            onChange={cambiarCampo}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            required
            aria-invalid={errores.usuario ? 'true' : undefined}
            aria-describedby={errores.usuario ? 'error-acceso-usuario' : undefined}
          />
          {errores.usuario && (
            <p className="campo__error" id="error-acceso-usuario">
              {errores.usuario}
            </p>
          )}
        </div>

        <div className="campo">
          <label className="campo__etiqueta" htmlFor="acceso-password">
            Contraseña <span aria-hidden="true">*</span>
            <span className="visualmente-oculto">(obligatorio)</span>
          </label>
          <input
            className={`campo__control${errores.password ? ' campo__control--error' : ''}`}
            id="acceso-password"
            name="password"
            ref={campoPassword}
            type="password"
            value={formulario.password}
            onChange={cambiarCampo}
            autoComplete="current-password"
            required
            aria-invalid={errores.password ? 'true' : undefined}
            aria-describedby={errores.password ? 'error-acceso-password' : undefined}
          />
          {errores.password && (
            <p className="campo__error" id="error-acceso-password">
              {errores.password}
            </p>
          )}
        </div>

        {fallo && (
          <p className="formulario__error" role="alert">
            {fallo}
          </p>
        )}

        <div className="formulario__acciones">
          <button className="boton boton--principal" type="submit" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </form>
    </section>
  );
}
