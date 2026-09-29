import { useEffect, useRef, useState } from 'react';
import { categoriasServicio } from '../services/categoriasServicio.js';

const FORMULARIO_VACIO = { nombre: '', descripcion: '' };

function ordenarPorNombre(categorias) {
  return [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export default function AdminCategorias() {
  const [fase, setFase] = useState('cargando');
  const [categorias, setCategorias] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');

  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState(null);
  const [exito, setExito] = useState('');

  const [confirmandoId, setConfirmandoId] = useState(null);
  const [errorBorrado, setErrorBorrado] = useState('');

  const campoNombre = useRef(null);

  useEffect(() => {
    let vigente = true;

    categoriasServicio
      .listar()
      .then((lista) => {
        if (!vigente) return;
        setCategorias(ordenarPorNombre(lista ?? []));
        setFase('listo');
      })
      .catch((error) => {
        if (!vigente) return;
        setErrorCarga(error.message);
        setFase('error');
      });

    return () => {
      vigente = false;
    };
  }, []);

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  }

  function empezarEdicion(categoria) {
    setEditandoId(categoria._id);
    setFormulario({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? '' });
    setErrorFormulario(null);
    setExito('');
    // Llevar el foco al formulario: si no, quien usa teclado tendría que
    // buscarlo a ciegas después de pulsar "Editar".
    campoNombre.current?.focus();
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormulario(FORMULARIO_VACIO);
    setErrorFormulario(null);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setErrorFormulario(null);
    setExito('');

    const datos = { nombre: formulario.nombre, descripcion: formulario.descripcion };

    try {
      if (editandoId) {
        const actualizada = await categoriasServicio.actualizar(editandoId, datos);
        setCategorias((anteriores) =>
          ordenarPorNombre(anteriores.map((c) => (c._id === editandoId ? actualizada : c))),
        );
        setExito(`Categoría «${actualizada.nombre}» actualizada.`);
        setEditandoId(null);
      } else {
        const creada = await categoriasServicio.crear(datos);
        setCategorias((anteriores) => ordenarPorNombre([...anteriores, creada]));
        setExito(`Categoría «${creada.nombre}» creada.`);
      }

      setFormulario(FORMULARIO_VACIO);
    } catch (error) {
      setErrorFormulario({ mensaje: error.message, detalles: error.detalles });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(categoria) {
    setErrorBorrado('');
    setExito('');

    try {
      await categoriasServicio.eliminar(categoria._id);
      setCategorias((anteriores) => anteriores.filter((c) => c._id !== categoria._id));
      setExito(`Categoría «${categoria.nombre}» eliminada.`);
      if (editandoId === categoria._id) cancelarEdicion();
    } catch (error) {
      // El caso típico: la categoría todavía tiene productos y la API responde 409.
      setErrorBorrado(error.message);
    } finally {
      setConfirmandoId(null);
    }
  }

  if (fase === 'cargando') {
    return (
      <p className="aviso" role="status">
        Cargando categorías…
      </p>
    );
  }

  if (fase === 'error') {
    return (
      <div className="aviso aviso--error" role="alert">
        <p className="aviso__titulo">No se pudieron cargar las categorías</p>
        <p className="aviso__detalle">{errorCarga}</p>
      </div>
    );
  }

  const errorNombre = errorFormulario?.detalles?.nombre;
  const errorDescripcion = errorFormulario?.detalles?.descripcion;

  return (
    <section className="panel" aria-labelledby="titulo-categorias">
      <h2 className="panel__titulo" id="titulo-categorias">
        Categorías
      </h2>

      <form className="formulario" onSubmit={enviar} noValidate>
        <p className="formulario__leyenda">
          {editandoId ? 'Editando una categoría existente' : 'Nueva categoría'}
        </p>

        <div className="campo">
          <label className="campo__etiqueta" htmlFor="categoria-nombre">
            Nombre <span aria-hidden="true">*</span>
            <span className="visualmente-oculto">(obligatorio)</span>
          </label>
          <input
            className={`campo__control${errorNombre ? ' campo__control--error' : ''}`}
            id="categoria-nombre"
            name="nombre"
            ref={campoNombre}
            value={formulario.nombre}
            onChange={cambiarCampo}
            maxLength={60}
            required
            aria-invalid={errorNombre ? 'true' : undefined}
            aria-describedby={errorNombre ? 'error-nombre' : undefined}
            placeholder="Fichas de póker"
          />
          {errorNombre && (
            <p className="campo__error" id="error-nombre">
              {errorNombre}
            </p>
          )}
        </div>

        <div className="campo">
          <label className="campo__etiqueta" htmlFor="categoria-descripcion">
            Descripción
          </label>
          <textarea
            className={`campo__control${errorDescripcion ? ' campo__control--error' : ''}`}
            id="categoria-descripcion"
            name="descripcion"
            value={formulario.descripcion}
            onChange={cambiarCampo}
            maxLength={300}
            rows={2}
            aria-invalid={errorDescripcion ? 'true' : undefined}
            aria-describedby={errorDescripcion ? 'error-descripcion' : undefined}
            placeholder="Fichas sueltas y por juegos completos."
          />
          {errorDescripcion && (
            <p className="campo__error" id="error-descripcion">
              {errorDescripcion}
            </p>
          )}
        </div>

        {/* El mensaje general va aparte del detalle por campo: aquí caen el 409 de
            nombre repetido y cualquier fallo de conexión. */}
        {errorFormulario && !errorNombre && !errorDescripcion && (
          <p className="formulario__error" role="alert">
            {errorFormulario.mensaje}
          </p>
        )}

        <div className="formulario__acciones">
          <button className="boton boton--principal" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear categoría'}
          </button>
          {editandoId && (
            <button className="boton boton--secundario" type="button" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <p className="panel__estado" role="status">
        {exito}
      </p>
      {errorBorrado && (
        <p className="formulario__error" role="alert">
          {errorBorrado}
        </p>
      )}

      {categorias.length === 0 ? (
        <p className="aviso__detalle">Todavía no hay categorías. Crea la primera arriba.</p>
      ) : (
        <ul className="lista">
          {categorias.map((categoria) => (
            <li className="lista__fila" key={categoria._id}>
              <div className="lista__datos">
                <p className="lista__nombre">{categoria.nombre}</p>
                {categoria.descripcion && (
                  <p className="lista__descripcion">{categoria.descripcion}</p>
                )}
              </div>

              {confirmandoId === categoria._id ? (
                <div className="lista__acciones" role="group" aria-label={`Confirmar eliminación de ${categoria.nombre}`}>
                  <span className="lista__pregunta">¿Eliminar?</span>
                  <button
                    className="boton boton--peligro"
                    type="button"
                    onClick={() => eliminar(categoria)}
                  >
                    Sí, eliminar
                  </button>
                  <button
                    className="boton boton--secundario"
                    type="button"
                    onClick={() => setConfirmandoId(null)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <div className="lista__acciones">
                  <button
                    className="boton boton--secundario"
                    type="button"
                    onClick={() => empezarEdicion(categoria)}
                  >
                    Editar<span className="visualmente-oculto"> {categoria.nombre}</span>
                  </button>
                  <button
                    className="boton boton--peligro"
                    type="button"
                    onClick={() => {
                      setConfirmandoId(categoria._id);
                      setErrorBorrado('');
                    }}
                  >
                    Eliminar<span className="visualmente-oculto"> {categoria.nombre}</span>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
