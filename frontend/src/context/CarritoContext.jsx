import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import {
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

  const valor = useMemo(() => ({
    items: estado.items,
    mensaje: estado.mensaje,
    totalUnidades: contarUnidades(estado.items),
    agregarProducto,
  }), [agregarProducto, estado.items, estado.mensaje]);

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
