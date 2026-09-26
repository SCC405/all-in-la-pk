export function errorHandler(error, _request, response, _next) {
  console.error('Error no controlado en la API:', error);
  response.status(500).json({
    error: 'Error interno del servidor',
  });
}
