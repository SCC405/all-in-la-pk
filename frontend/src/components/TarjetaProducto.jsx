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

export default function TarjetaProducto({ producto }) {
  const [imagenFallida, setImagenFallida] = useState(false);
  const stock = textoStock(producto.stock);

  // `categoria` llega resuelta por el backend, pero puede faltar si el producto
  // quedó apuntando a una categoría borrada: la tarjeta no debe romperse por eso.
  const categoria = producto.categoria?.nombre ?? 'Sin categoría';

  return (
    <article className="producto">
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
        <p className="producto__categoria">{categoria}</p>
        <h2 className="producto__nombre">{producto.nombre}</h2>

        {producto.descripcion && <p className="producto__descripcion">{producto.descripcion}</p>}

        <div className="producto__pie">
          <p className="producto__precio">{formateadorPrecio.format(producto.precio)}</p>
          <p className={`producto__stock${stock.agotado ? ' producto__stock--agotado' : ''}`}>
            {stock.texto}
          </p>
        </div>
      </div>
    </article>
  );
}
