import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import {
  calcularTotal,
  carritoReducer,
  contarUnidades,
  ESTADO_INICIAL_CARRITO,
} from '../utils/carrito.js';

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [estado, dispatch] = useReducer(carritoReducer, ESTADO_INICIAL_CARRITO);

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

  const valor = useMemo(() => ({
    items: estado.items,
    mensaje: estado.mensaje,
    totalPrecio: calcularTotal(estado.items),
    totalUnidades: contarUnidades(estado.items),
    agregarProducto,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
  }), [
    agregarProducto,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    estado.items,
    estado.mensaje,
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
