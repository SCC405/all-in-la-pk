import { useCarrito } from '../context/CarritoContext.jsx';

export default function CarritoResumen() {
  const { items, mensaje, totalUnidades } = useCarrito();

  return (
    <div className="carrito">
      <details className="carrito__desplegable">
        <summary className="carrito__activador">
          <span aria-hidden="true">♣</span>
          Carrito
          <span
            className="carrito__contador"
            aria-label={`${totalUnidades} ${totalUnidades === 1 ? 'producto' : 'productos'}`}
          >
            {totalUnidades}
          </span>
        </summary>

        <section className="carrito__panel" aria-labelledby="titulo-carrito">
          <h2 className="carrito__titulo" id="titulo-carrito">Tu carrito</h2>

          {items.length === 0 ? (
            <p className="carrito__vacio">Todavía no has agregado productos.</p>
          ) : (
            <ul className="carrito__lista">
              {items.map(({ producto, cantidad }) => (
                <li className="carrito__item" key={producto._id}>
                  <span>{producto.nombre}</span>
                  <span aria-label={`Cantidad: ${cantidad}`}>×{cantidad}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </details>

      <p className="visualmente-oculto" aria-live="polite" aria-atomic="true">
        {mensaje}
      </p>
    </div>
  );
}
