import { Router } from 'express';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../controllers/categorias.controller.js';

const categoriasRouter = Router();

categoriasRouter.get('/', listarCategorias);
categoriasRouter.post('/', crearCategoria);
categoriasRouter.put('/:id', actualizarCategoria);
categoriasRouter.delete('/:id', eliminarCategoria);

export default categoriasRouter;
