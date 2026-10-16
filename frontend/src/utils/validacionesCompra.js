// Validación de los datos de envío y pago (HU-32).
//
// Mismo contrato que `validaciones.js`: el resultado tiene la forma
// `{ campo: mensaje }`, para que la interfaz no distinga de dónde vino el error.
//
// A diferencia del panel administrativo, aquí no hay un esquema de Mongoose
// detrás que repita las reglas: el pedido no se guarda. Así que estas son las
// únicas comprobaciones, y por eso se escriben con cuidado.

export const FORMAS_DE_PAGO = Object.freeze([
  { valor: 'contra-entrega', etiqueta: 'Pago contra entrega' },
  { valor: 'transferencia', etiqueta: 'Transferencia bancaria' },
  { valor: 'tarjeta', etiqueta: 'Tarjeta (se coordina al confirmar)' },
]);

export const LIMITES_COMPRA = {
  nombre: 100,
  direccion: 200,
  ciudad: 60,
  telefono: 20,
  correo: 120,
};

// Orden en que se ven en pantalla, para llevar el foco al primero que falle.
export const ORDEN_CAMPOS_COMPRA = [
  'nombre',
  'correo',
  'telefono',
  'direccion',
  'ciudad',
  'pago',
];

export const FORMULARIO_COMPRA_VACIO = Object.freeze({
  nombre: '',
  correo: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  pago: '',
});

const FORMAS_VALIDAS = new Set(FORMAS_DE_PAGO.map(({ valor }) => valor));

function vacio(valor) {
  return typeof valor !== 'string' || valor.trim() === '';
}

function demasiadoLargo(valor, maximo) {
  return typeof valor === 'string' && valor.trim().length > maximo;
}

// Deliberadamente laxo: comprueba que haya algo, una arroba y un punto después.
// Validar correos con una expresión estricta rechaza direcciones legítimas, y
// la única forma de saber de verdad si existe es escribirle.
function pareceCorreo(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

// Colombia usa 10 cifras para móvil y 7 para fijo, pero se aceptan indicativos
// y separadores: lo que se exige es que queden entre 7 y 15 dígitos.
function pareceTelefono(valor) {
  const limpio = valor.replace(/[\s()+-]/g, '');
  return /^\d{7,15}$/.test(limpio);
}

export function validarCompra(formulario = {}) {
  const errores = {};

  if (vacio(formulario.nombre)) {
    errores.nombre = 'El nombre es obligatorio.';
  } else if (demasiadoLargo(formulario.nombre, LIMITES_COMPRA.nombre)) {
    errores.nombre = `El nombre no puede superar los ${LIMITES_COMPRA.nombre} caracteres.`;
  }

  if (vacio(formulario.correo)) {
    errores.correo = 'El correo es obligatorio.';
  } else if (demasiadoLargo(formulario.correo, LIMITES_COMPRA.correo)) {
    errores.correo = `El correo no puede superar los ${LIMITES_COMPRA.correo} caracteres.`;
  } else if (!pareceCorreo(formulario.correo)) {
    errores.correo = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
  }

  if (vacio(formulario.telefono)) {
    errores.telefono = 'El teléfono es obligatorio.';
  } else if (!pareceTelefono(formulario.telefono)) {
    errores.telefono = 'Escribe un teléfono válido, entre 7 y 15 dígitos.';
  }

  if (vacio(formulario.direccion)) {
    errores.direccion = 'La dirección es obligatoria.';
  } else if (demasiadoLargo(formulario.direccion, LIMITES_COMPRA.direccion)) {
    errores.direccion = `La dirección no puede superar los ${LIMITES_COMPRA.direccion} caracteres.`;
  }

  if (vacio(formulario.ciudad)) {
    errores.ciudad = 'La ciudad es obligatoria.';
  } else if (demasiadoLargo(formulario.ciudad, LIMITES_COMPRA.ciudad)) {
    errores.ciudad = `La ciudad no puede superar los ${LIMITES_COMPRA.ciudad} caracteres.`;
  }

  if (vacio(formulario.pago)) {
    errores.pago = 'Elige una forma de pago.';
  } else if (!FORMAS_VALIDAS.has(formulario.pago)) {
    errores.pago = 'Esa forma de pago no está disponible.';
  }

  return errores;
}

/**
 * ¿Están todos los campos obligatorios rellenos?
 *
 * Es más flojo que `validarCompra`: solo mira si hay algo escrito, sin juzgar
 * el formato. Sirve para habilitar el botón de comprar, no para dar por buenos
 * los datos; de eso se encarga la validación completa al enviar.
 */
export function compraCompleta(formulario = {}) {
  return ORDEN_CAMPOS_COMPRA.every((campo) => !vacio(formulario[campo]));
}

export function etiquetaDePago(valor) {
  return FORMAS_DE_PAGO.find((forma) => forma.valor === valor)?.etiqueta ?? '';
}
