const CODIGO_DUPLICADO_MONGODB = 11000;

// Traduce los errores de Mongoose a respuestas HTTP. Está centralizado aquí para
// que categorías (HU-03) y productos (HU-05) respondan igual ante el mismo fallo.
export function errorHandler(error, _request, response, _next) {
  if (error?.name === 'ValidationError') {
    response.status(400).json({
      error: 'Datos no válidos',
      detalles: Object.fromEntries(
        Object.entries(error.errors).map(([campo, detalle]) => [campo, detalle.message]),
      ),
    });
    return;
  }

  // Ocurre cuando el :id de la URL no tiene forma de ObjectId.
  if (error?.name === 'CastError') {
    response.status(400).json({ error: 'El identificador recibido no es válido' });
    return;
  }

  if (error?.code === CODIGO_DUPLICADO_MONGODB) {
    response.status(409).json({ error: 'Ya existe un registro con ese nombre' });
    return;
  }

  console.error('Error no controlado en la API:', error);
  response.status(500).json({
    error: 'Error interno del servidor',
  });
}
