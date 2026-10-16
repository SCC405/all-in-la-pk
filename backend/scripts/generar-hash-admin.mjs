// Genera el valor de ADMIN_PASSWORD_HASH a partir de una contraseña.
//
//   npm run hash-admin --prefix backend -- "mi contraseña"
//
// La contraseña se pasa como argumento y no se guarda en ningún sitio: lo que
// se copia al `.env` es el hash, que no permite recuperarla.
import { generarHash } from '../src/utils/password.js';

const password = process.argv[2];

if (!password) {
  console.error('Falta la contraseña.\n');
  console.error('  npm run hash-admin --prefix backend -- "mi contraseña"\n');
  console.error('Usa comillas si lleva espacios o caracteres que el shell interprete.');
  process.exit(1);
}

if (password.length < 8) {
  console.error('La contraseña debe tener al menos 8 caracteres.');
  process.exit(1);
}

console.log('\nCopia esta línea en backend/.env (y en las variables de Render):\n');
console.log(`ADMIN_PASSWORD_HASH=${generarHash(password)}\n`);
console.log('Recuerda definir también ADMIN_USUARIO y SESION_SECRET.');
console.log('Para SESION_SECRET sirve cualquier cadena larga y aleatoria, por ejemplo:');
console.log(`SESION_SECRET=${(await import('node:crypto')).randomBytes(32).toString('hex')}\n`);
