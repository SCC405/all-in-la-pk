// Las pruebas de integración eliminan los documentos que crean. Como el clúster
// de Atlas se comparte con otro proyecto, apuntar MONGODB_URI_TEST a la base real
// por descuido significaría perder datos. Este guardia lo impide.

const SUFIJOS_PERMITIDOS = ['_test', '-test'];

function nombreDeLaBase(uri) {
  // mongodb+srv://usuario:clave@host/all_in_la_pk_test?retryWrites=true
  // Se corta por '?' y por '/' sin usar URL(), que no acepta el esquema mongodb+srv.
  const sinParametros = uri.split('?')[0];
  const partes = sinParametros.split('/');

  return partes.length > 3 ? partes[partes.length - 1] : '';
}

/**
 * Devuelve la URI de pruebas, o `null` si no hay ninguna configurada.
 * Lanza si la URI apunta a una base que no es de pruebas.
 */
export function uriDePruebas() {
  const uri = process.env.MONGODB_URI_TEST?.trim();

  if (!uri) return null;

  const base = nombreDeLaBase(uri);

  if (!base) {
    throw new Error(
      'MONGODB_URI_TEST no indica una base de datos. Agrega el nombre al final de la URI, ' +
        'por ejemplo .../all_in_la_pk_test',
    );
  }

  if (!SUFIJOS_PERMITIDOS.some((sufijo) => base.endsWith(sufijo))) {
    throw new Error(
      `Las pruebas eliminan datos al terminar y "${base}" no parece una base de pruebas. ` +
        'Usa una que termine en "_test" (por ejemplo all_in_la_pk_test). ' +
        'Nunca apuntes MONGODB_URI_TEST a la base real del proyecto.',
    );
  }

  return uri;
}

export const MOTIVO_SIN_BASE =
  'define MONGODB_URI_TEST (una base terminada en _test) para ejecutar las pruebas contra un MongoDB real';
