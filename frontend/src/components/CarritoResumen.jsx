import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext.jsx';
import { calcularSubtotal, CANTIDAD_MINIMA } from '../utils/carrito.js';

const formateadorPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function CarritoResumen() {
  const {
    items,
    mensaje,
    totalPrecio,
    totalUnidades,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
  } = useCarrito();

  // El contador da un golpe cuando cambia la cuenta. En una pantalla ancha el
  // carrito queda lejos del boton que se acaba de pulsar, y sin esto no hay
  // forma de saber si el clic conto.
  const [late, setLate] = useState(false);
  const anterior = useRef(totalUnidades);

  useEffect(() => {
    if (anterior.current === totalUnidades) return;

    anterior.current = totalUnidades;
    setLate(true);

    // Se quita la clase al acabar para que la animacion pueda repetirse en el
    // siguiente cambio: una animacion CSS no se reinicia sola.
    const temporizador = setTimeout(() => setLate(false), 300);
    return () => clearTimeout(temporizador);
  }, [totalUnidades]);

  const desplegable = useRef(null);
  const { pathname } = useLocation();

  const cerrar = useCallback(() => {
    if (desplegable.current) desplegable.current.open = false;
  }, []);

  // Al cambiar de página se cierra. Sobre todo al pulsar «Comprar»: el panel
  // se quedaba abierto encima del resumen de compra, tapando justo lo que se
  // acaba de ir a mirar.
  useEffect(() => {
    cerrar();
  }, [cerrar, pathname]);

  // Y se cierra como se espera de cualquier desplegable: pulsando fuera o con
  // Escape. <details> no hace ninguna de las dos por su cuenta.
  useEffect(() => {
    function alPulsarFuera(evento) {
      if (!desplegable.current?.open) return;
      if (desplegable.current.contains(evento.target)) return;
      cerrar();
    }

    function alPulsarTecla(evento) {
      if (evento.key !== 'Escape' || !desplegable.current?.open) return;

      cerrar();
      // El foco vuelve al activador: si no, quien cierra con teclado lo pierde
      // y tiene que recorrer la cabecera otra vez.
      desplegable.current.querySelector('summary')?.focus();
    }

    // `pointerdown` y no `click`: así cierra en cuanto se pulsa, antes de que
    // el clic llegue a lo que haya debajo.
    document.addEventListener('pointerdown', alPulsarFuera);
    document.addEventListener('keydown', alPulsarTecla);

    return () => {
      document.removeEventListener('pointerdown', alPulsarFuera);
      document.removeEventListener('keydown', alPulsarTecla);
    };
  }, [cerrar]);

  return (
    <div className="carrito">
      <details className="carrito__desplegable" ref={desplegable}>
        <summary className="carrito__activador">
          <span aria-hidden="true">♣</span>
          Carrito
          <span
            className={`carrito__contador${late ? ' carrito__contador--late' : ''}`}
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
            <>
              <ul className="carrito__lista">
                {items.map(({ producto, cantidad }) => {
                  const enElMinimo = cantidad <= CANTIDAD_MINIMA;
                  const sinMasStock = cantidad >= producto.stock;
                  const subtotal = calcularSubtotal({ producto, cantidad });

                  return (
                    <li className="carrito__item" key={producto._id}>
                      <div className="carrito__datos">
                        <span className="carrito__nombre">{producto.nombre}</span>
                        <span className="carrito__subtotal">
                          <span className="visualmente-oculto">Subtotal: </span>
                          {formateadorPrecio.format(subtotal)}
                        </span>
                      </div>

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

              <dl className="carrito__total">
                <div>
                  <dt>Total</dt>
                  <dd aria-live="polite" aria-atomic="true">
                    {formateadorPrecio.format(totalPrecio)}
                  </dd>
                </div>
              </dl>

              <p className="carrito__comprar">
                <Link className="boton boton--principal" to="/compra">
                  Comprar
                </Link>
              </p>
            </>
          )}
        </section>
      </details>

      <p className="visualmente-oculto" aria-live="polite" aria-atomic="true">
        {mensaje}
      </p>
    </div>
  );
}
