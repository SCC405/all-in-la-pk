import { useEffect, useState } from 'react';
import TarjetaProducto from '../components/TarjetaProducto.jsx';
import { productosServicio } from '../services/productosServicio.js';

export default function Catalogo() {
  const [estado, setEstado] = useState({ fase: 'cargando' });

  useEffect(() => {
    let vigente = true;

    productosServicio
      .listar()
      .then((productos) => {
        if (vigente) setEstado({ fase: 'listo', productos: productos ?? [] });
      })
      .catch((error) => {
        if (vigente) setEstado({ fase: 'error', mensaje: error.message });
      });

    return () => {
      vigente = false;
    };
  }, []);

  if (estado.fase === 'cargando') {
    return (
      <p className="aviso" role="status">
        Cargando el catálogo…
      </p>
    );
  }

  if (estado.fase === 'error') {
    return (
      <div className="aviso aviso--error" role="alert">
        <p className="aviso__titulo">No se pudo cargar el catálogo</p>
        <p className="aviso__detalle">{estado.mensaje}</p>
      </div>
    );
  }

  if (estado.productos.length === 0) {
    return (
      <div className="aviso" role="status">
        <p className="aviso__titulo">Todavía no hay productos en la tienda</p>
        <p className="aviso__detalle">
          Cuando se registren productos desde el panel de administración aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <section className="catalogo">
      <div className="catalogo__encabezado">
        <h1 className="catalogo__titulo">Catálogo</h1>
        <p className="catalogo__conteo">
          {estado.productos.length} {estado.productos.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      <div className="catalogo__rejilla">
        {estado.productos.map((producto) => (
          <TarjetaProducto key={producto._id} producto={producto} />
        ))}
      </div>
    </section>
  );
}
