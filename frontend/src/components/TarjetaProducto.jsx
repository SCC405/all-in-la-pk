import { useState } from 'react';

const formateadorPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function textoStock(stock) {
  if (stock === 0) return { texto: 'Agotado', agotado: true };
  if (stock <= 5) return { texto: `Últimas ${stock} unidades`, agotado: false };
  return { texto: `${stock} disponibles`, agotado: false };
}

export default function TarjetaProducto({ producto, onAgregar }) {
  const [imagenFallida, setImagenFallida] = useState(false);
  const stock = textoStock(producto.stock);

  // `categoria` llega resuelta por el backend, pero puede faltar si el producto
  // quedó apuntando a una categoría borrada: la tarjeta no debe romperse por eso.
  const categoria = producto.categoria?.nombre ?? 'Sin categoría';

  // Nombra el <article> con el título del producto: quien navegue por artículos
  // con un lector de pantalla oye "Tapete verde profesional" y no solo "artículo".
  const idNombre = `producto-${producto._id}`;

  return (
    <article className="producto" aria-labelledby={idNombre}>
      <div className="producto__imagen">
        {imagenFallida ? (
          <span className="producto__sin-imagen" aria-hidden="true">
            ♠
          </span>
        ) : (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenFallida(true)}
          />
        )}
      </div>

      <div className="producto__cuerpo">
        {/* Las etiquetas ocultas dicen qué es cada dato. Sin ellas un lector de
            pantalla recita "Tapetes, 95.000, últimas 4 unidades" sin nombrarlos. */}
        <p className="producto__categoria">
          <span className="visualmente-oculto">Categoría: </span>
          {categoria}
        </p>
        <h2 className="producto__nombre" id={idNombre}>
          {producto.nombre}
        </h2>

        {producto.descripcion && <p className="producto__descripcion">{producto.descripcion}</p>}

        <div className="producto__pie">
          <p className="producto__precio">
            <span className="visualmente-oculto">Precio: </span>
            {formateadorPrecio.format(producto.precio)}
          </p>
          <p className={`producto__stock${stock.agotado ? ' producto__stock--agotado' : ''}`}>
            <span className="visualmente-oculto">Disponibilidad: </span>
            {stock.texto}
          </p>
        </div>

        <button
          className="producto__agregar"
          type="button"
          disabled={stock.agotado}
          onClick={() => onAgregar(producto)}
          aria-label={stock.agotado
            ? `${producto.nombre} está agotado`
            : `Agregar ${producto.nombre} al carrito`}
        >
          {stock.agotado ? 'Producto agotado' : 'Agregar al carrito'}
        </button>
      </div>
    </article>
  );
}
