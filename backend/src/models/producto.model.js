import mongoose from 'mongoose';

export const NOMBRE_PRODUCTO_MAX_LENGTH = 100;
export const DESCRIPCION_PRODUCTO_MAX_LENGTH = 1000;
export const IMAGEN_MAX_LENGTH = 2048;

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio.'],
      trim: true,
      maxLength: [
        NOMBRE_PRODUCTO_MAX_LENGTH,
        `El nombre del producto no puede superar los ${NOMBRE_PRODUCTO_MAX_LENGTH} caracteres.`,
      ],
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
      maxLength: [
        DESCRIPCION_PRODUCTO_MAX_LENGTH,
        `La descripción no puede superar los ${DESCRIPCION_PRODUCTO_MAX_LENGTH} caracteres.`,
      ],
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio.'],
      min: [0, 'El precio no puede ser negativo.'],
      validate: {
        validator: Number.isFinite,
        message: 'El precio debe ser un número finito.',
      },
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio.'],
      min: [0, 'El stock no puede ser negativo.'],
      validate: {
        validator: Number.isInteger,
        message: 'El stock debe ser un número entero.',
      },
    },
    imagen: {
      type: String,
      required: [true, 'La imagen del producto es obligatoria.'],
      trim: true,
      maxLength: [
        IMAGEN_MAX_LENGTH,
        `La dirección de la imagen no puede superar los ${IMAGEN_MAX_LENGTH} caracteres.`,
      ],
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoría del producto es obligatoria.'],
      index: true,
    },
  },
  { timestamps: true },
);

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;
