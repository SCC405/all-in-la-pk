import { useEffect, useState } from 'react';
import FiltroCategorias from '../components/FiltroCategorias.jsx';
import TarjetaProducto from '../components/TarjetaProducto.jsx';
import { categoriasServicio } from '../services/categoriasServicio.js';
import { productosServicio } from '../services/productosServicio.js';
import { filtrarProductosPorCategoria } from '../utils/filtrarProductos.js';
import { useCarrito } from '../context/CarritoContext.jsx';

export default function Catalogo() {
  const { agregarProducto, sincronizarConCatalogo } = useCarrito();
  const [estado, setEstado] = useState({ fase: 'cargando' });
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  useEffect(() => {
    let vigente = true;

    Promise.all([productosServicio.listar(), categoriasServicio.listar()])
      .then(([productos, categorias]) => {
        if (!vigente) return;

        setEstado({
          fase: 'listo',
          productos: productos ?? [],
          categorias: categorias ?? [],
        });

        // Un carrito guardado de una visita anterior lleva dentro los precios
        // de entonces. Estos son los datos frescos: es el momento de refrescarlo.
        sincronizarConCatalogo(productos ?? []);
      })
      .catch((error) => {
        if (vigente) setEstado({ fase: 'error', mensaje: error.message });
      });

    return () => {
      vigente = false;
    };
  }, [sincronizarConCatalogo]);

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

  const productosVisibles = filtrarProductosPorCategoria(
    estado.productos,
    categoriaSeleccionada,
  );

  const categoriaActiva = estado.categorias.find(
    (categoria) => categoria._id === categoriaSeleccionada,
  );

  return (
    <section className="catalogo" aria-labelledby="titulo-catalogo">
      <div className="catalogo__encabezado">
        <div>
          <h1 className="catalogo__titulo" id="titulo-catalogo">
            Catálogo
          </h1>
          <p className="catalogo__conteo" aria-live="polite">
            {productosVisibles.length}{' '}
            {productosVisibles.length === 1 ? 'producto' : 'productos'}
            {categoriaActiva ? ` en ${categoriaActiva.nombre}` : ''}
          </p>
        </div>

        <FiltroCategorias
          categorias={estado.categorias}
          valor={categoriaSeleccionada}
          alCambiar={setCategoriaSeleccionada}
        />
      </div>

      {productosVisibles.length === 0 ? (
        <div className="aviso" role="status">
          <p className="aviso__titulo">No hay productos en esta categoría</p>
          <p className="aviso__detalle">
            Selecciona otra categoría o vuelve a «Todas las categorías».
          </p>
        </div>
      ) : (
        <div className="catalogo__rejilla">
          {productosVisibles.map((producto) => (
            <TarjetaProducto
              key={producto._id}
              producto={producto}
              onAgregar={agregarProducto}
            />
          ))}
        </div>
      )}
    </section>
  );
}
