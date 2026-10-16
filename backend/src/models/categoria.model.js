import mongoose from 'mongoose';

export const NOMBRE_MAX_LENGTH = 60;
export const DESCRIPCION_MAX_LENGTH = 300;

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio.'],
      trim: true,
      maxLength: [
        NOMBRE_MAX_LENGTH,
        `El nombre de la categoría no puede superar los ${NOMBRE_MAX_LENGTH} caracteres.`,
      ],
      // Dos categorías con el mismo nombre dejarían el catálogo ambiguo:
      // el visitante no sabría cuál filtrar. El índice se aplica sobre el
      // nombre ya normalizado por `trim`.
      unique: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
      maxLength: [
        DESCRIPCION_MAX_LENGTH,
        `La descripción no puede superar los ${DESCRIPCION_MAX_LENGTH} caracteres.`,
      ],
    },
  },
  { timestamps: true },
);

const Categoria = mongoose.model('Categoria', categoriaSchema);

export default Categoria;
