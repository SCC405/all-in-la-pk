// Genera un certificado autofirmado para poder servir HTTPS en local.
//
// En producción NO se usa: el proveedor de despliegue emite y renueva su propio
// certificado. Este solo existe para poder demostrar HTTPS sin desplegar.
//
//   npm run certificados
//
// Los archivos quedan en backend/certs/, que está en .gitignore.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raizBackend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const carpeta = join(raizBackend, 'certs');
const clave = join(carpeta, 'localhost-key.pem');
const certificado = join(carpeta, 'localhost-cert.pem');

if (existsSync(clave) && existsSync(certificado) && !process.argv.includes('--force')) {
  console.log('Ya existen certificados en backend/certs. Usa --force para regenerarlos.');
  process.exit(0);
}

mkdirSync(carpeta, { recursive: true });

// subjectAltName es obligatorio: sin él los navegadores modernos rechazan el
// certificado aunque el Common Name coincida.
const argumentos = [
  'req', '-x509', '-newkey', 'rsa:2048', '-sha256', '-days', '365', '-nodes',
  '-keyout', clave,
  '-out', certificado,
  '-subj', '/C=CO/O=All In La PK/CN=localhost',
  '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1',
];

try {
  execFileSync('openssl', argumentos, { stdio: ['ignore', 'ignore', 'pipe'] });
} catch (error) {
  const detalle = error.code === 'ENOENT'
    ? 'No se encontró "openssl". En Windows viene con Git; ejecuta este script desde Git Bash.'
    : error.stderr?.toString().trim() || error.message;

  console.error(`No fue posible generar los certificados.\n${detalle}`);
  process.exit(1);
}

console.log(`Certificados generados (válidos 365 días):
  ${clave}
  ${certificado}

Añade esto a backend/.env para que el servidor los use:

  HTTPS_KEY_PATH=./certs/localhost-key.pem
  HTTPS_CERT_PATH=./certs/localhost-cert.pem

Al abrir https://localhost:4000 el navegador avisará de que el certificado no
está firmado por una autoridad conocida. Es lo esperado en un autofirmado:
se acepta la excepción y la conexión queda cifrada igualmente.`);
