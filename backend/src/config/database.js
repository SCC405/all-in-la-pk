import mongoose from 'mongoose';

const CONNECTION_TIMEOUT_MS = 10_000;

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
      'No fue posible conectar con MongoDB. Verifica MONGODB_URI y la disponibilidad del servicio.',
      { cause: error },
    );
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
