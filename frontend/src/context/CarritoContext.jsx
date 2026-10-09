import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import {
  calcularTotal,
  carritoReducer,
  contarUnidades,
  ESTADO_INICIAL_CARRITO,
} from '../utils/carrito.js';
import { cargarCarrito, guardarCarrito } from '../utils/carritoAlmacen.js';

const CarritoContext = createContext(null);

// Se lee del navegador una sola vez, al montar. Como `useReducer` acepta un
// inicializador perezoso, no se toca localStorage en cada render.
function estadoInicial() {
  return { ...ESTADO_INICIAL_CARRITO, items: cargarCarrito() };
}

export function CarritoProvider({ children }) {
  const [estado, dispatch] = useReducer(carritoReducer, undefined, estadoInicial);

  // Se guarda en cuanto cambian los artículos. El mensaje no se persiste: es
  // para anunciar lo que acaba de pasar, no para recuperarlo mañana.
  useEffect(() => {
    guardarCarrito(estado.items);
  }, [estado.items]);

  const agregarProducto = useCallback((producto) => {
    dispatch({ type: 'producto/agregado', producto });
  }, []);

  const aumentarCantidad = useCallback((productoId) => {
    dispatch({ type: 'cantidad/aumentada', productoId });
  }, []);

  const disminuirCantidad = useCallback((productoId) => {
    dispatch({ type: 'cantidad/disminuida', productoId });
  }, []);

  const eliminarProducto = useCallback((productoId) => {
    dispatch({ type: 'producto/eliminado', productoId });
  }, []);

  const vaciarCarrito = useCallback(() => {
    dispatch({ type: 'carrito/vaciado' });
  }, []);

  // La llama el catálogo en cuanto tiene productos frescos, para que un
  // carrito guardado no arrastre precios de ayer.
  const sincronizarConCatalogo = useCallback((productos) => {
    dispatch({ type: 'carrito/sincronizado', productos });
  }, []);

  const valor = useMemo(() => ({
    items: estado.items,
    mensaje: estado.mensaje,
    totalPrecio: calcularTotal(estado.items),
    totalUnidades: contarUnidades(estado.items),
    agregarProducto,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    sincronizarConCatalogo,
    vaciarCarrito,
  }), [
    agregarProducto,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    estado.items,
    estado.mensaje,
    sincronizarConCatalogo,
    vaciarCarrito,
  ]);

  return (
    <CarritoContext.Provider value={valor}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);

  if (!contexto) {
    throw new Error('useCarrito debe utilizarse dentro de CarritoProvider.');
  }

  return contexto;
}
