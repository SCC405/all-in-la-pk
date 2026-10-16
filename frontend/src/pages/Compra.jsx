import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext.jsx';
import { calcularSubtotal, CANTIDAD_MINIMA } from '../utils/carrito.js';
import { calcularTotales, ENVIO_GRATIS_DESDE, faltaParaEnvioGratis } from '../utils/envio.js';
import { construirPedido } from '../utils/pedido.js';
import { primerCampoConError } from '../utils/validaciones.js';
import {
  compraCompleta,
  FORMAS_DE_PAGO,
  FORMULARIO_COMPRA_VACIO,
  LIMITES_COMPRA,
  ORDEN_CAMPOS_COMPRA,
  validarCompra,
} from '../utils/validacionesCompra.js';

const formateadorPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function idError(campo) {
  return `compra-error-${campo}`;
}

export default function Compra() {
  const {
    items,
    totalPrecio,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    vaciarCarrito,
  } = useCarrito();
  const navegar = useNavigate();

  const [formulario, setFormulario] = useState(FORMULARIO_COMPRA_VACIO);
  const [errores, setErrores] = useState({});

  const referencias = {
    nombre: useRef(null),
    correo: useRef(null),
    telefono: useRef(null),
    direccion: useRef(null),
    ciudad: useRef(null),
    pago: useRef(null),
  };

  const totales = calcularTotales(totalPrecio);
  const falta = faltaParaEnvioGratis(totalPrecio);

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

  function comprar(evento) {
    evento.preventDefault();

    const encontrados = validarCompra(formulario);

    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados);
      referencias[primerCampoConError(encontrados, ORDEN_CAMPOS_COMPRA)]?.current?.focus();
      return;
    }

    const pedido = construirPedido({ items, datos: formulario });

    vaciarCarrito();

    // `replace` para que el botón de atrás no devuelva al formulario con el
    // carrito ya vacío, ni permita reenviar la compra.
    navegar('/compra/confirmacion', { replace: true, state: { pedido } });
  }

  if (items.length === 0) {
    return (
      <div className="aviso" role="status">
        <p className="aviso__titulo">Tu carrito está vacío</p>
        <p className="aviso__detalle">
          Agrega productos desde el catálogo para poder completar una compra.
        </p>
        <p className="compra__volver">
          <Link className="boton boton--secundario" to="/">
            Ver el catálogo
          </Link>
        </p>
      </div>
    );
  }

  const puedeComprar = compraCompleta(formulario);

  return (
    <section className="compra" aria-labelledby="titulo-compra">
      <h1 className="compra__titulo" id="titulo-compra">
        Confirmar compra
      </h1>
      <p className="compra__intro">
        Revisa lo que vas a llevar y dinos a dónde lo enviamos.
      </p>

      <div className="compra__columnas">
        <section className="compra__resumen" aria-labelledby="titulo-resumen">
          <h2 className="compra__subtitulo" id="titulo-resumen">
            Tu pedido
          </h2>

          <ul className="resumen-compra">
            {items.map(({ producto, cantidad }) => (
              <li className="resumen-compra__linea" key={producto._id}>
                <div className="resumen-compra__datos">
                  <p className="resumen-compra__nombre">{producto.nombre}</p>
                  <p className="resumen-compra__unitario">
                    {formateadorPrecio.format(producto.precio)} por unidad
                  </p>

                  <div
                    className="resumen-compra__controles"
                    role="group"
                    aria-label={`Cantidad de ${producto.nombre}`}
                  >
                    <button
                      className="carrito__paso"
                      type="button"
                      onClick={() => disminuirCantidad(producto._id)}
                      disabled={cantidad <= CANTIDAD_MINIMA}
                      aria-label={`Quitar una unidad de ${producto.nombre}`}
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <span className="carrito__cantidad" aria-label={`Cantidad: ${cantidad}`}>
                      {cantidad}
                    </span>
                    <button
                      className="carrito__paso"
                      type="button"
                      onClick={() => aumentarCantidad(producto._id)}
                      disabled={cantidad >= producto.stock}
                      aria-label={
                        cantidad >= producto.stock
                          ? `No quedan más unidades de ${producto.nombre}`
                          : `Agregar una unidad de ${producto.nombre}`
                      }
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                    <button
                      className="carrito__quitar"
                      type="button"
                      onClick={() => eliminarProducto(producto._id)}
                    >
                      Quitar
                      <span className="visualmente-oculto"> {producto.nombre} del pedido</span>
                    </button>
                  </div>
                </div>

                <p className="resumen-compra__subtotal">
                  <span className="visualmente-oculto">Subtotal: </span>
                  {formateadorPrecio.format(calcularSubtotal({ producto, cantidad }))}
                </p>
              </li>
            ))}
          </ul>

          <dl className="totales" aria-live="polite">
            <div className="totales__fila">
              <dt>Productos</dt>
              <dd>{formateadorPrecio.format(totales.productos)}</dd>
            </div>
            <div className="totales__fila">
              <dt>Envío</dt>
              <dd>
                {totales.envio === 0 ? 'Gratis' : formateadorPrecio.format(totales.envio)}
              </dd>
            </div>
            <div className="totales__fila totales__fila--total">
              <dt>Total</dt>
              <dd>{formateadorPrecio.format(totales.total)}</dd>
            </div>
          </dl>

          {falta > 0 && (
            <p className="totales__aviso">
              Te faltan {formateadorPrecio.format(falta)} para que el envío salga gratis.
              Desde {formateadorPrecio.format(ENVIO_GRATIS_DESDE)} no se cobra.
            </p>
          )}

          <p className="compra__volver">
            <Link className="boton boton--secundario" to="/">
              Seguir comprando
            </Link>
          </p>
        </section>

        <form className="formulario compra__datos" onSubmit={comprar} noValidate>
          <p className="formulario__leyenda">Datos de envío</p>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="compra-nombre">
              Nombre completo <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <input
              className={`campo__control${errores.nombre ? ' campo__control--error' : ''}`}
              id="compra-nombre"
              name="nombre"
              ref={referencias.nombre}
              value={formulario.nombre}
              onChange={cambiarCampo}
              maxLength={LIMITES_COMPRA.nombre}
              autoComplete="name"
              required
              aria-invalid={errores.nombre ? 'true' : undefined}
              aria-describedby={errores.nombre ? idError('nombre') : undefined}
              placeholder="Nicolay Baquero"
            />
            {errores.nombre && (
              <p className="campo__error" id={idError('nombre')}>{errores.nombre}</p>
            )}
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="compra-correo">
              Correo <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <input
              className={`campo__control${errores.correo ? ' campo__control--error' : ''}`}
              id="compra-correo"
              name="correo"
              ref={referencias.correo}
              type="email"
              value={formulario.correo}
              onChange={cambiarCampo}
              maxLength={LIMITES_COMPRA.correo}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              required
              aria-invalid={errores.correo ? 'true' : undefined}
              aria-describedby={
                errores.correo ? `compra-ayuda-correo ${idError('correo')}` : 'compra-ayuda-correo'
              }
              placeholder="nombre@correo.com"
            />
            <p className="campo__ayuda" id="compra-ayuda-correo">
              Ahí te escribimos para coordinar el pago y la entrega.
            </p>
            {errores.correo && (
              <p className="campo__error" id={idError('correo')}>{errores.correo}</p>
            )}
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="compra-telefono">
              Teléfono <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <input
              className={`campo__control${errores.telefono ? ' campo__control--error' : ''}`}
              id="compra-telefono"
              name="telefono"
              ref={referencias.telefono}
              type="tel"
              inputMode="tel"
              value={formulario.telefono}
              onChange={cambiarCampo}
              maxLength={LIMITES_COMPRA.telefono}
              autoComplete="tel"
              required
              aria-invalid={errores.telefono ? 'true' : undefined}
              aria-describedby={errores.telefono ? idError('telefono') : undefined}
              placeholder="300 123 4567"
            />
            {errores.telefono && (
              <p className="campo__error" id={idError('telefono')}>{errores.telefono}</p>
            )}
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="compra-direccion">
              Dirección <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <input
              className={`campo__control${errores.direccion ? ' campo__control--error' : ''}`}
              id="compra-direccion"
              name="direccion"
              ref={referencias.direccion}
              value={formulario.direccion}
              onChange={cambiarCampo}
              maxLength={LIMITES_COMPRA.direccion}
              autoComplete="street-address"
              required
              aria-invalid={errores.direccion ? 'true' : undefined}
              aria-describedby={errores.direccion ? idError('direccion') : undefined}
              placeholder="Calle 10 # 5-23, apto 301"
            />
            {errores.direccion && (
              <p className="campo__error" id={idError('direccion')}>{errores.direccion}</p>
            )}
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="compra-ciudad">
              Ciudad <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <input
              className={`campo__control${errores.ciudad ? ' campo__control--error' : ''}`}
              id="compra-ciudad"
              name="ciudad"
              ref={referencias.ciudad}
              value={formulario.ciudad}
              onChange={cambiarCampo}
              maxLength={LIMITES_COMPRA.ciudad}
              autoComplete="address-level2"
              required
              aria-invalid={errores.ciudad ? 'true' : undefined}
              aria-describedby={errores.ciudad ? idError('ciudad') : undefined}
              placeholder="Medellín"
            />
            {errores.ciudad && (
              <p className="campo__error" id={idError('ciudad')}>{errores.ciudad}</p>
            )}
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="compra-pago">
              Forma de pago <span aria-hidden="true">*</span>
              <span className="visualmente-oculto">(obligatorio)</span>
            </label>
            <select
              className={`campo__control${errores.pago ? ' campo__control--error' : ''}`}
              id="compra-pago"
              name="pago"
              ref={referencias.pago}
              value={formulario.pago}
              onChange={cambiarCampo}
              required
              aria-invalid={errores.pago ? 'true' : undefined}
              aria-describedby={
                errores.pago ? `compra-ayuda-pago ${idError('pago')}` : 'compra-ayuda-pago'
              }
            >
              <option value="">Elige una opción</option>
              {FORMAS_DE_PAGO.map(({ valor, etiqueta }) => (
                <option key={valor} value={valor}>{etiqueta}</option>
              ))}
            </select>
            <p className="campo__ayuda" id="compra-ayuda-pago">
              No pedimos datos de tarjeta aquí. El pago se coordina al confirmar el pedido.
            </p>
            {errores.pago && (
              <p className="campo__error" id={idError('pago')}>{errores.pago}</p>
            )}
          </div>

          <div className="formulario__acciones">
            <button
              className="boton boton--principal"
              type="submit"
              disabled={!puedeComprar}
              aria-describedby={puedeComprar ? undefined : 'compra-ayuda-boton'}
            >
              Comprar ahora
            </button>
          </div>

          {/* El botón deshabilitado sin explicación es una trampa: se dice por
              qué, y se anuncia al lector de pantalla desde el propio botón. */}
          {!puedeComprar && (
            <p className="campo__ayuda" id="compra-ayuda-boton">
              Completa los datos de envío y la forma de pago para continuar.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
