import { useEffect, useRef, useState } from 'react';
import { categoriasServicio } from '../services/categoriasServicio.js';
import { productosServicio } from '../services/productosServicio.js';
import {
  FORMULARIO_PRODUCTO_VACIO,
  ordenarProductosPorNombre,
  prepararProducto,
  productoAFormulario,
  quitarProducto,
  reemplazarProducto,
} from '../utils/productosFormulario.js';

const formateadorPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const CAMPOS = ['nombre', 'descripcion', 'precio', 'stock', 'imagen', 'categoria'];

function idError(campo) {
  return `producto-error-${campo}`;
}

export default function AdminProductos() {
  const [fase, setFase] = useState('cargando');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');

  const [formulario, setFormulario] = useState(FORMULARIO_PRODUCTO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState(null);
  const [exito, setExito] = useState('');

  const [confirmandoId, setConfirmandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [errorBorrado, setErrorBorrado] = useState('');

  const campoNombre = useRef(null);

  useEffect(() => {
    let vigente = true;

    Promise.all([productosServicio.listar(), categoriasServicio.listar()])
      .then(([listaProductos, listaCategorias]) => {
        if (!vigente) return;
        setProductos(ordenarProductosPorNombre(listaProductos ?? []));
        setCategorias(listaCategorias ?? []);
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

  function empezarEdicion(producto) {
    setEditandoId(producto._id);
    setFormulario(productoAFormulario(producto));
    setErrorFormulario(null);
    setErrorBorrado('');
    setExito('');
    campoNombre.current?.focus();
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormulario(FORMULARIO_PRODUCTO_VACIO);
    setErrorFormulario(null);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setErrorFormulario(null);
    setExito('');

    try {
      const datos = prepararProducto(formulario);

      if (editandoId) {
        const actualizado = await productosServicio.actualizar(editandoId, datos);
        setProductos((anteriores) => reemplazarProducto(anteriores, actualizado));
        setExito(`Producto «${actualizado.nombre}» actualizado.`);
        setEditandoId(null);
      } else {
        const creado = await productosServicio.crear(datos);
        setProductos((anteriores) => ordenarProductosPorNombre([...anteriores, creado]));
        setExito(`Producto «${creado.nombre}» creado.`);
      }

      setFormulario(FORMULARIO_PRODUCTO_VACIO);
    } catch (error) {
      setErrorFormulario({ mensaje: error.message, detalles: error.detalles });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(producto) {
    setEliminandoId(producto._id);
    setErrorBorrado('');
    setExito('');

    try {
      await productosServicio.eliminar(producto._id);
      setProductos((anteriores) => quitarProducto(anteriores, producto._id));
      setExito(`Producto «${producto.nombre}» eliminado.`);
      if (editandoId === producto._id) cancelarEdicion();
    } catch (error) {
      setErrorBorrado(error.message);
    } finally {
      setEliminandoId(null);
      setConfirmandoId(null);
    }
  }

  if (fase === 'cargando') {
    return (
      <p className="aviso" role="status">
        Cargando productos…
      </p>
    );
  }

  if (fase === 'error') {
    return (
      <div className="aviso aviso--error" role="alert">
        <p className="aviso__titulo">No se pudieron cargar los productos</p>
        <p className="aviso__detalle">{errorCarga}</p>
      </div>
    );
  }

  const detalles = errorFormulario?.detalles ?? {};
  const tieneErroresPorCampo = CAMPOS.some((nombre) => detalles[nombre]);
  const sinCategorias = categorias.length === 0;

  return (
    <section className="panel" aria-labelledby="titulo-productos">
      <h2 className="panel__titulo" id="titulo-productos">Productos</h2>

      {sinCategorias && (
        <div className="aviso aviso--advertencia" role="status">
          <p className="aviso__titulo">Primero crea una categoría</p>
          <p className="aviso__detalle">
            Todo producto debe pertenecer a una categoría antes de guardarse.
          </p>
        </div>
      )}

      <form className="formulario" onSubmit={enviar} noValidate>
        <p className="formulario__leyenda">
          {editandoId ? 'Editando un producto existente' : 'Nuevo producto'}
        </p>

        <div className="formulario__rejilla">
          <div className="campo">
            <label className="campo__etiqueta" htmlFor="producto-nombre">
              Nombre <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <input
              className={`campo__control${detalles.nombre ? ' campo__control--error' : ''}`}
              id="producto-nombre"
              name="nombre"
              ref={campoNombre}
              value={formulario.nombre}
              onChange={cambiarCampo}
              maxLength={100}
              required
              aria-invalid={detalles.nombre ? 'true' : undefined}
              aria-describedby={detalles.nombre ? idError('nombre') : undefined}
              placeholder="Baraja profesional"
            />
            {detalles.nombre && <p className="campo__error" id={idError('nombre')}>{detalles.nombre}</p>}
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="producto-categoria">
              Categoría <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <select
              className={`campo__control${detalles.categoria ? ' campo__control--error' : ''}`}
              id="producto-categoria"
              name="categoria"
              value={formulario.categoria}
              onChange={cambiarCampo}
              required
              disabled={sinCategorias}
              aria-invalid={detalles.categoria ? 'true' : undefined}
              aria-describedby={detalles.categoria ? idError('categoria') : undefined}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria._id} value={categoria._id}>{categoria.nombre}</option>
              ))}
            </select>
            {detalles.categoria && <p className="campo__error" id={idError('categoria')}>{detalles.categoria}</p>}
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="producto-precio">
              Precio <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <input
              className={`campo__control${detalles.precio ? ' campo__control--error' : ''}`}
              id="producto-precio"
              name="precio"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={formulario.precio}
              onChange={cambiarCampo}
              required
              aria-invalid={detalles.precio ? 'true' : undefined}
              aria-describedby={detalles.precio
                ? `producto-ayuda-precio ${idError('precio')}`
                : 'producto-ayuda-precio'}
              placeholder="45000"
            />
            <p className="campo__ayuda" id="producto-ayuda-precio">Valor en pesos colombianos.</p>
            {detalles.precio && <p className="campo__error" id={idError('precio')}>{detalles.precio}</p>}
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="producto-stock">
              Stock <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <input
              className={`campo__control${detalles.stock ? ' campo__control--error' : ''}`}
              id="producto-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={formulario.stock}
              onChange={cambiarCampo}
              required
              aria-invalid={detalles.stock ? 'true' : undefined}
              aria-describedby={detalles.stock
                ? `producto-ayuda-stock ${idError('stock')}`
                : 'producto-ayuda-stock'}
              placeholder="12"
            />
            <p className="campo__ayuda" id="producto-ayuda-stock">Número entero de unidades disponibles.</p>
            {detalles.stock && <p className="campo__error" id={idError('stock')}>{detalles.stock}</p>}
          </div>

          <div className="campo campo--ancho-completo">
            <label className="campo__etiqueta" htmlFor="producto-imagen">
              Dirección de la imagen <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <input
              className={`campo__control${detalles.imagen ? ' campo__control--error' : ''}`}
              id="producto-imagen"
              name="imagen"
              type="url"
              value={formulario.imagen}
              onChange={cambiarCampo}
              maxLength={2048}
              required
              aria-invalid={detalles.imagen ? 'true' : undefined}
              aria-describedby={detalles.imagen ? idError('imagen') : undefined}
              placeholder="https://ejemplo.com/baraja.jpg"
            />
            {detalles.imagen && <p className="campo__error" id={idError('imagen')}>{detalles.imagen}</p>}
          </div>

          <div className="campo campo--ancho-completo">
            <label className="campo__etiqueta" htmlFor="producto-descripcion">Descripción</label>
            <textarea
              className={`campo__control${detalles.descripcion ? ' campo__control--error' : ''}`}
              id="producto-descripcion"
              name="descripcion"
              value={formulario.descripcion}
              onChange={cambiarCampo}
              maxLength={1000}
              rows={3}
              aria-invalid={detalles.descripcion ? 'true' : undefined}
              aria-describedby={detalles.descripcion ? idError('descripcion') : undefined}
              placeholder="Baraja plástica resistente para uso frecuente."
            />
            {detalles.descripcion && <p className="campo__error" id={idError('descripcion')}>{detalles.descripcion}</p>}
          </div>
        </div>

        {errorFormulario && !tieneErroresPorCampo && (
          <p className="formulario__error" role="alert">{errorFormulario.mensaje}</p>
        )}

        <div className="formulario__acciones">
          <button
            className="boton boton--principal"
            type="submit"
            disabled={guardando || sinCategorias}
          >
            {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {editandoId && (
            <button className="boton boton--secundario" type="button" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <p className="panel__estado" role="status" aria-live="polite">{exito}</p>
      {errorBorrado && <p className="formulario__error" role="alert">{errorBorrado}</p>}

      {productos.length === 0 ? (
        <p className="aviso__detalle">Todavía no hay productos. Crea el primero arriba.</p>
      ) : (
        <ul className="lista lista--productos">
          {productos.map((producto) => {
            const categoria = producto.categoria?.nombre ?? 'Sin categoría';

            return (
              <li className="lista__fila" key={producto._id}>
                <div className="lista__datos">
                  <p className="lista__nombre">{producto.nombre}</p>
                  <p className="lista__descripcion">{categoria}</p>
                  <dl className="producto-admin__resumen">
                    <div>
                      <dt>Precio</dt>
                      <dd>{formateadorPrecio.format(producto.precio)}</dd>
                    </div>
                    <div>
                      <dt>Stock</dt>
                      <dd>{producto.stock}</dd>
                    </div>
                  </dl>
                </div>

                {confirmandoId === producto._id ? (
                  <div
                    className="lista__acciones"
                    role="group"
                    aria-label={`Confirmar eliminación de ${producto.nombre}`}
                  >
                    <span className="lista__pregunta">¿Eliminar?</span>
                    <button
                      className="boton boton--peligro"
                      type="button"
                      disabled={eliminandoId === producto._id}
                      onClick={() => eliminar(producto)}
                    >
                      {eliminandoId === producto._id ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                    <button
                      className="boton boton--secundario"
                      type="button"
                      disabled={eliminandoId === producto._id}
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
                      onClick={() => empezarEdicion(producto)}
                    >
                      Editar<span className="visualmente-oculto"> {producto.nombre}</span>
                    </button>
                    <button
                      className="boton boton--peligro"
                      type="button"
                      onClick={() => {
                        setConfirmandoId(producto._id);
                        setErrorBorrado('');
                      }}
                    >
                      Eliminar<span className="visualmente-oculto"> {producto.nombre}</span>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
