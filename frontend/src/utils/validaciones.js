// Validación en el cliente para los formularios del panel administrativo.
//
// El servidor sigue siendo la autoridad: estas reglas solo evitan el viaje de
// ida y vuelta cuando el error es evidente, y dan respuesta inmediata al
// escribir. Por eso los mensajes son LOS MISMOS que devuelve el backend: el
// administrador ve el texto idéntico lo detecte quien lo detecte.
//
// El resultado tiene la forma `{ campo: mensaje }`, igual que el `detalles`
// de la API, para que la interfaz no distinga de dónde vino el error.

export const LIMITES = {
  categoriaNombre: 60,
  categoriaDescripcion: 300,
  productoNombre: 100,
  productoDescripcion: 1000,
  imagen: 2048,
};

function vacio(valor) {
  return typeof valor !== 'string' || valor.trim() === '';
}

function demasiadoLargo(valor, maximo) {
  return typeof valor === 'string' && valor.trim().length > maximo;
}

export function validarCategoria(formulario = {}) {
  const errores = {};

  if (vacio(formulario.nombre)) {
    errores.nombre = 'El nombre de la categoría es obligatorio.';
  } else if (demasiadoLargo(formulario.nombre, LIMITES.categoriaNombre)) {
    errores.nombre = `El nombre de la categoría no puede superar los ${LIMITES.categoriaNombre} caracteres.`;
  }

  if (demasiadoLargo(formulario.descripcion, LIMITES.categoriaDescripcion)) {
    errores.descripcion = `La descripción no puede superar los ${LIMITES.categoriaDescripcion} caracteres.`;
  }

  return errores;
}

function validarNumero(valor, { nombre, obligatorio, entero }) {
  if (vacio(valor)) return obligatorio;

  // Number('') es 0 y Number(' ') también, por eso se descarta el vacío antes.
  const numero = Number(valor);

  if (!Number.isFinite(numero)) return `El ${nombre} debe ser un número finito.`;
  if (numero < 0) return `El ${nombre} no puede ser negativo.`;
  if (entero && !Number.isInteger(numero)) return `El ${nombre} debe ser un número entero.`;

  return null;
}

export function validarProducto(formulario = {}) {
  const errores = {};

  if (vacio(formulario.nombre)) {
    errores.nombre = 'El nombre del producto es obligatorio.';
  } else if (demasiadoLargo(formulario.nombre, LIMITES.productoNombre)) {
    errores.nombre = `El nombre del producto no puede superar los ${LIMITES.productoNombre} caracteres.`;
  }

  if (vacio(formulario.categoria)) {
    errores.categoria = 'La categoría del producto es obligatoria.';
  }

  const precio = validarNumero(formulario.precio, {
    nombre: 'precio',
    obligatorio: 'El precio es obligatorio.',
    entero: false,
  });
  if (precio) errores.precio = precio;

  const stock = validarNumero(formulario.stock, {
    nombre: 'stock',
    obligatorio: 'El stock es obligatorio.',
    entero: true,
  });
  if (stock) errores.stock = stock;

  if (vacio(formulario.imagen)) {
    errores.imagen = 'La imagen del producto es obligatoria.';
  } else if (demasiadoLargo(formulario.imagen, LIMITES.imagen)) {
    errores.imagen = `La dirección de la imagen no puede superar los ${LIMITES.imagen} caracteres.`;
  }

  if (demasiadoLargo(formulario.descripcion, LIMITES.productoDescripcion)) {
    errores.descripcion = `La descripción no puede superar los ${LIMITES.productoDescripcion} caracteres.`;
  }

  return errores;
}

export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}

/** Nombre del primer campo con error, según el orden en que se ven en pantalla. */
export function primerCampoConError(errores, orden) {
  return orden.find((campo) => errores[campo]) ?? null;
}
