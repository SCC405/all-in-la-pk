import mongoose from 'mongoose';

const CONNECTION_TIMEOUT_MS = 10_000;

// Clasifica el fallo para poder diagnosticarlo sin exponer la cadena de
// conexión. Decir solo "no fue posible conectar" obliga a adivinar entre
// causas muy distintas; esto nombra la causa sin repetir nada del error
// original, que sí puede contener usuario y contraseña.
function pistaSegura(error) {
  const nombre = error?.name ?? '';
  const codigo = error?.code;
  const texto = String(error?.message ?? '');

  if (nombre === 'MongoParseError') {
    return 'La cadena de conexión está mal formada. Revisa el formato de MONGODB_URI.';
  }

  if (codigo === 8000 || codigo === 18 || /bad auth|authentication failed/i.test(texto)) {
    return 'El servidor rechazó las credenciales. Revisa el usuario y la contraseña, ' +
      'y que los caracteres especiales de la contraseña estén codificados.';
  }

  // Las cadenas mongodb+srv necesitan una consulta DNS de tipo SRV, que
  // algunas redes bloquean. El fallo ocurre antes de llegar al servidor, asi
  // que no tiene nada que ver con las credenciales.
  if (['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT'].includes(codigo) && /querySrv/i.test(texto)) {
    return 'La red no pudo resolver la dirección del clúster (consulta DNS de tipo SRV). ' +
      'Suele ocurrir en redes que filtran ese tipo de consulta; prueba desde otra red o ' +
      'usa la cadena de conexión larga que ofrece Atlas.';
  }

  if (nombre === 'MongooseServerSelectionError') {
    return 'No se pudo alcanzar el clúster. Revisa que la lista de IP permitidas incluya ' +
      'el servidor y que el clúster no esté pausado.';
  }

  return 'Verifica MONGODB_URI y la disponibilidad del servicio.';
}

export async function connectDatabase(uri) {
  const connectionString = uri?.trim();

  if (!connectionString) {
    throw new Error(
      'MONGODB_URI no está configurada. Copia .env.example a .env y agrega la cadena de conexión.',
    );
  }

  try {
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
    });
    console.log('Conexión con MongoDB establecida correctamente.');
    return mongoose.connection;
  } catch (error) {
    throw new Error(
      `No fue posible conectar con MongoDB. ${pistaSegura(error)}`,
      { cause: error },
    );
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
