import { Link, Navigate, useLocation } from 'react-router-dom';

const formateadorPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function CompraConfirmada() {
  const { state } = useLocation();
  const pedido = state?.pedido;

  // Se llega aquí solo desde el formulario, que trae el pedido en el estado de
  // la navegación. Entrar a mano o recargar no muestra una confirmación vacía:
  // el pedido no se guarda en ninguna parte, así que no hay nada que recuperar.
  if (!pedido) {
    return <Navigate to="/" replace />;
  }

  const { envio, lineas, pago, referencia, totales } = pedido;

  return (
    <section className="confirmacion" aria-labelledby="titulo-confirmacion">
      {/* role="status" para que un lector de pantalla anuncie la confirmación
          al llegar, en vez de dejarla pasar en silencio. */}
      <div role="status">
        <p className="confirmacion__marca" aria-hidden="true">♠</p>
        <h1 className="confirmacion__titulo" id="titulo-confirmacion">
          Compra confirmada
        </h1>
        <p className="confirmacion__intro">
          Gracias, {envio.nombre}. Te escribimos a <strong>{envio.correo}</strong> para
          coordinar el pago y la entrega.
        </p>
      </div>

      <p className="confirmacion__referencia">
        <span className="confirmacion__referencia-etiqueta">Número de pedido</span>
        <strong>{referencia}</strong>
      </p>

      <div className="confirmacion__bloques">
        <section aria-labelledby="titulo-confirmacion-pedido">
          <h2 className="compra__subtitulo" id="titulo-confirmacion-pedido">
            Lo que pediste
          </h2>

          <ul className="resumen-compra">
            {lineas.map((linea) => (
              <li className="resumen-compra__linea" key={linea.id}>
                <div className="resumen-compra__datos">
                  <p className="resumen-compra__nombre">{linea.nombre}</p>
                  <p className="resumen-compra__unitario">
                    {linea.cantidad} × {formateadorPrecio.format(linea.precioUnitario)}
                  </p>
                </div>
                <p className="resumen-compra__subtotal">
                  <span className="visualmente-oculto">Subtotal: </span>
                  {formateadorPrecio.format(linea.subtotal)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="totales">
            <div className="totales__fila">
              <dt>Productos</dt>
              <dd>{formateadorPrecio.format(totales.productos)}</dd>
            </div>
            <div className="totales__fila">
              <dt>Envío</dt>
              <dd>{totales.envio === 0 ? 'Gratis' : formateadorPrecio.format(totales.envio)}</dd>
            </div>
            <div className="totales__fila totales__fila--total">
              <dt>Total</dt>
              <dd>{formateadorPrecio.format(totales.total)}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="titulo-confirmacion-envio">
          <h2 className="compra__subtitulo" id="titulo-confirmacion-envio">
            Dónde lo enviamos
          </h2>

          <address className="confirmacion__direccion">
            {envio.nombre}
            <br />
            {envio.direccion}
            <br />
            {envio.ciudad}
            <br />
            {envio.telefono}
          </address>

          <h2 className="compra__subtitulo" id="titulo-confirmacion-pago">
            Forma de pago
          </h2>
          <p className="confirmacion__pago" aria-labelledby="titulo-confirmacion-pago">
            {pago.etiqueta}
          </p>
        </section>
      </div>

      <p className="compra__volver">
        <Link className="boton boton--principal" to="/">
          Volver al catálogo
        </Link>
      </p>
    </section>
  );
}
