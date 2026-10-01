import { useCarrito } from '../context/CarritoContext.jsx';
import { CANTIDAD_MINIMA } from '../utils/carrito.js';

export default function CarritoResumen() {
  const {
    items,
    mensaje,
    totalUnidades,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
  } = useCarrito();

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
              {items.map(({ producto, cantidad }) => {
                const enElMinimo = cantidad <= CANTIDAD_MINIMA;
                const sinMasStock = cantidad >= producto.stock;

                return (
                  <li className="carrito__item" key={producto._id}>
                    <span className="carrito__nombre">{producto.nombre}</span>

                    <div
                      className="carrito__controles"
                      role="group"
                      aria-label={`Cantidad de ${producto.nombre}`}
                    >
                      <button
                        className="carrito__paso"
                        type="button"
                        onClick={() => disminuirCantidad(producto._id)}
                        disabled={enElMinimo}
                        aria-label={`Quitar una unidad de ${producto.nombre}`}
                      >
                        <span aria-hidden="true">−</span>
                      </button>

                      {/* El valor se anuncia con su etiqueta para que un lector de
                          pantalla no lea solo un número suelto entre dos botones. */}
                      <span className="carrito__cantidad" aria-label={`Cantidad: ${cantidad}`}>
                        {cantidad}
                      </span>

                      <button
                        className="carrito__paso"
                        type="button"
                        onClick={() => aumentarCantidad(producto._id)}
                        disabled={sinMasStock}
                        aria-label={
                          sinMasStock
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
                        <span className="visualmente-oculto"> {producto.nombre} del carrito</span>
                      </button>
                    </div>
                  </li>
                );
              })}
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
