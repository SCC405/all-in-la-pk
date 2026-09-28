import { Router } from 'express';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
  obtenerProducto,
} from '../controllers/productos.controller.js';

const productosRouter = Router();

productosRouter.get('/', listarProductos);
productosRouter.get('/:id', obtenerProducto);
productosRouter.post('/', crearProducto);
productosRouter.put('/:id', actualizarProducto);
productosRouter.delete('/:id', eliminarProducto);

export default productosRouter;
