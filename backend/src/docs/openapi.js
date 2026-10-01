// Especificación OpenAPI de la API REST de All In La PK.
//
// Se mantiene en un único archivo (en vez de repartida en comentarios por las rutas)
// para que un tercero pueda leer el contrato completo de un vistazo, que es lo que
// pide RNF-05: comprender y probar los endpoints sin revisar el código fuente.

const idObjeto = {
  type: 'string',
  pattern: '^[0-9a-fA-F]{24}$',
  example: '6710f1c2a4b9e2d3c4f5a6b7',
  description: 'Identificador de MongoDB (24 caracteres hexadecimales).',
};

const urlImagen = {
  type: 'string',
  format: 'uri',
  pattern: '^https?://',
  maxLength: 2048,
  example: 'https://ejemplo.com/set-500-fichas.jpg',
  description: 'Dirección absoluta de una imagen. Solo admite los protocolos HTTP y HTTPS.',
};

const parametroId = (recurso) => ({
  name: 'id',
  in: 'path',
  required: true,
  schema: idObjeto,
  description: `Identificador de ${recurso}.`,
});

const respuestaError = (descripcion, ejemplo) => ({
  description: descripcion,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
      example: ejemplo,
    },
  },
});

const ERROR_ID = respuestaError('El identificador de la URL no tiene forma de ObjectId.', {
  error: 'El identificador recibido no es válido',
});

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'All In La PK — API REST',
    version: '1.0.0',
    description: [
      'API REST de **All In La PK**, tienda en línea de artículos y accesorios de póker.',
      '',
      'Expone la gestión de **categorías** y **productos** del catálogo. El backend no renderiza',
      'vistas: únicamente recibe solicitudes y devuelve JSON (RNF-03).',
      '',
      '## Errores',
      '',
      'Todos los errores comparten la misma forma:',
      '',
      '```json',
      '{ "error": "Datos no válidos",',
      '  "detalles": { "precio": "El precio no puede ser negativo." } }',
      '```',
      '',
      'El campo `detalles` solo aparece cuando falla la validación del esquema, con un mensaje',
      'por cada campo incorrecto, para que un formulario pueda señalar exactamente qué corregir.',
    ].join('\n'),
  },
  servers: [
    {
      url: '/api',
      description: 'El mismo servidor que sirve esta documentación.',
    },
  ],
  tags: [
    { name: 'Categorías', description: 'Organización del catálogo por tipo de artículo.' },
    { name: 'Productos', description: 'Artículos en venta, cada uno asociado a una categoría.' },
    { name: 'Sistema', description: 'Comprobación del estado del servicio y token CSRF.' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Comprobar que la API responde',
        responses: {
          200: {
            description: 'El servicio está disponible.',
            content: {
              'application/json': {
                example: { status: 'ok', service: 'all-in-la-pk-backend', environment: 'development' },
              },
            },
          },
        },
      },
    },

    '/csrf-token': {
      get: {
        tags: ['Sistema'],
        summary: 'Obtener un token CSRF',
        description: [
          'Emite un token, lo deja en la cookie `XSRF-TOKEN` y lo devuelve en el cuerpo.',
          '',
          'Toda operación que modifique datos (`POST`, `PUT`, `DELETE`) debe reenviarlo en la',
          'cabecera `X-CSRF-Token`. Si falta o no coincide con la cookie, la API responde `403`.',
        ].join('\n'),
        responses: {
          200: {
            description: 'Token emitido.',
            content: {
              'application/json': {
                example: { csrfToken: '9f8e…c1.4a7b…d2' },
              },
            },
          },
        },
      },
    },

    '/categorias': {
      get: {
        tags: ['Categorías'],
        summary: 'Listar todas las categorías',
        description: 'Devuelve las categorías ordenadas alfabéticamente por nombre.',
        responses: {
          200: {
            description: 'Lista de categorías. Puede venir vacía.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Categoria' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categorías'],
        summary: 'Crear una categoría',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoriaCreacion' },
              example: { nombre: 'Fichas de póker', descripcion: 'Fichas sueltas y por juegos completos.' },
            },
          },
        },
        responses: {
          201: {
            description: 'Categoría creada.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Categoria' } },
            },
          },
          400: respuestaError('Faltan campos obligatorios o no cumplen las reglas.', {
            error: 'Datos no válidos',
            detalles: { nombre: 'El nombre de la categoría es obligatorio.' },
          }),
          409: respuestaError('Ya existe una categoría con ese nombre.', {
            error: 'Ya existe un registro con ese nombre',
          }),
        },
      },
    },

    '/categorias/{id}': {
      put: {
        tags: ['Categorías'],
        summary: 'Actualizar una categoría',
        description: 'Solo se modifican los campos enviados; el resto conserva su valor.',
        parameters: [parametroId('la categoría')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoriaActualizacion' },
              example: { nombre: 'Mesas de póker', descripcion: 'Plegables y profesionales.' },
            },
          },
        },
        responses: {
          200: {
            description: 'Categoría actualizada.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Categoria' } },
            },
          },
          400: ERROR_ID,
          404: respuestaError('No existe una categoría con ese identificador.', {
            error: 'Categoría no encontrada',
          }),
          409: respuestaError('Otra categoría ya usa ese nombre.', {
            error: 'Ya existe un registro con ese nombre',
          }),
        },
      },
      delete: {
        tags: ['Categorías'],
        summary: 'Eliminar una categoría',
        description:
          'Solo se puede eliminar una categoría que no tenga productos asociados. Así ningún producto queda apuntando a una categoría inexistente.',
        parameters: [parametroId('la categoría')],
        responses: {
          204: { description: 'Categoría eliminada. No devuelve cuerpo.' },
          400: ERROR_ID,
          404: respuestaError('No existe una categoría con ese identificador.', {
            error: 'Categoría no encontrada',
          }),
          409: respuestaError('La categoría todavía tiene productos asociados.', {
            error:
              'No se puede eliminar la categoría porque tiene 3 producto(s) asociado(s). Cámbialos de categoría o elimínalos primero.',
          }),
        },
      },
    },

    '/productos': {
      get: {
        tags: ['Productos'],
        summary: 'Listar todos los productos',
        description:
          'Devuelve los productos ordenados por nombre. Cada producto incluye su categoría ya resuelta, no solo el identificador.',
        responses: {
          200: {
            description: 'Lista de productos. Puede venir vacía.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Producto' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Productos'],
        summary: 'Crear un producto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductoCreacion' },
              example: {
                nombre: 'Set de 500 fichas profesionales',
                descripcion: 'Fichas de arcilla de 14 g en maletín de aluminio.',
                precio: 320000,
                stock: 12,
                imagen: 'https://ejemplo.com/set-500-fichas.jpg',
                categoria: '6710f1c2a4b9e2d3c4f5a6b7',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Producto creado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Producto' } },
            },
          },
          400: respuestaError(
            'Faltan campos obligatorios, no cumplen las reglas, o la categoría indicada no existe.',
            { error: 'La categoría indicada no existe' },
          ),
        },
      },
    },

    '/productos/{id}': {
      get: {
        tags: ['Productos'],
        summary: 'Consultar un producto',
        parameters: [parametroId('el producto')],
        responses: {
          200: {
            description: 'Producto encontrado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Producto' } },
            },
          },
          400: ERROR_ID,
          404: respuestaError('No existe un producto con ese identificador.', {
            error: 'Producto no encontrado',
          }),
        },
      },
      put: {
        tags: ['Productos'],
        summary: 'Actualizar un producto',
        description: 'Solo se modifican los campos enviados; el resto conserva su valor.',
        parameters: [parametroId('el producto')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductoActualizacion' },
              example: { precio: 299000, stock: 8 },
            },
          },
        },
        responses: {
          200: {
            description: 'Producto actualizado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Producto' } },
            },
          },
          400: respuestaError('Datos no válidos, identificador mal formado o categoría inexistente.', {
            error: 'Datos no válidos',
            detalles: { stock: 'El stock debe ser un número entero.' },
          }),
          404: respuestaError('No existe un producto con ese identificador.', {
            error: 'Producto no encontrado',
          }),
        },
      },
      delete: {
        tags: ['Productos'],
        summary: 'Eliminar un producto',
        parameters: [parametroId('el producto')],
        responses: {
          204: { description: 'Producto eliminado. No devuelve cuerpo.' },
          400: ERROR_ID,
          404: respuestaError('No existe un producto con ese identificador.', {
            error: 'Producto no encontrado',
          }),
        },
      },
    },
  },

  components: {
    schemas: {
      Categoria: {
        type: 'object',
        properties: {
          _id: idObjeto,
          nombre: { type: 'string', maxLength: 60, example: 'Fichas de póker' },
          descripcion: { type: 'string', maxLength: 300, example: 'Fichas sueltas y por juegos completos.' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CategoriaCampos: {
        type: 'object',
        properties: {
          nombre: {
            type: 'string',
            maxLength: 60,
            description: 'Obligatorio y único. Se le quitan los espacios sobrantes.',
            example: 'Fichas de póker',
          },
          descripcion: { type: 'string', maxLength: 300, example: 'Fichas sueltas y por juegos completos.' },
        },
      },
      CategoriaCreacion: {
        allOf: [
          { $ref: '#/components/schemas/CategoriaCampos' },
          { type: 'object', required: ['nombre'] },
        ],
      },
      CategoriaActualizacion: {
        allOf: [{ $ref: '#/components/schemas/CategoriaCampos' }],
        description: 'Solo se modifican los campos enviados; ninguno es obligatorio por sí solo.',
      },
      Producto: {
        type: 'object',
        properties: {
          _id: idObjeto,
          nombre: { type: 'string', maxLength: 100, example: 'Set de 500 fichas profesionales' },
          descripcion: { type: 'string', maxLength: 1000 },
          precio: { type: 'number', minimum: 0, example: 320000 },
          stock: { type: 'integer', minimum: 0, example: 12 },
          imagen: { ...urlImagen },
          categoria: {
            allOf: [{ $ref: '#/components/schemas/Categoria' }],
            description: 'Categoría ya resuelta. Al crear o actualizar se envía solo su identificador.',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProductoCampos: {
        type: 'object',
        properties: {
          nombre: { type: 'string', maxLength: 100, example: 'Set de 500 fichas profesionales' },
          descripcion: { type: 'string', maxLength: 1000 },
          precio: { type: 'number', minimum: 0, description: 'No puede ser negativo.', example: 320000 },
          stock: { type: 'integer', minimum: 0, description: 'Entero, no puede ser negativo.', example: 12 },
          imagen: { ...urlImagen },
          categoria: {
            allOf: [idObjeto],
            description: 'Identificador de una categoría existente. Si no existe, la API responde 400.',
          },
        },
      },
      ProductoCreacion: {
        allOf: [
          { $ref: '#/components/schemas/ProductoCampos' },
          { type: 'object', required: ['nombre', 'precio', 'stock', 'imagen', 'categoria'] },
        ],
      },
      ProductoActualizacion: {
        allOf: [{ $ref: '#/components/schemas/ProductoCampos' }],
        description: 'Solo se modifican los campos enviados; ninguno es obligatorio por sí solo.',
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Descripción legible del problema.' },
          detalles: {
            type: 'object',
            additionalProperties: { type: 'string' },
            description: 'Solo en errores de validación: un mensaje por cada campo incorrecto.',
          },
        },
      },
    },
  },
};

export default openapi;
