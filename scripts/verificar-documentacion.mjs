#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rutaDocumento = resolve(raiz, 'docs', 'DOCUMENTACION_TECNICA.md');
const resultados = [];

function comprobar(condicion, nombre, detalle) {
  resultados.push({ estado: condicion ? 'OK' : 'FALLO', nombre, detalle });
  if (!condicion) process.exitCode = 1;
}

async function existe(ruta) {
  try {
    await access(ruta);
    return true;
  } catch {
    return false;
  }
}

const documento = await readFile(rutaDocumento, 'utf8');
const secciones = [
  '## 1. Arquitectura',
  '## 3. Frontend',
  '## 4. Backend',
  '## 5. Base de datos',
  '## 6. Requisitos e instalación',
  '## 7. Ejecución',
  '## 8. Swagger y contrato de la API',
];

for (const seccion of secciones) {
  comprobar(documento.includes(seccion), seccion.replace(/^## \d+\. /, ''), 'Sección presente');
}

const variables = [
  'MONGODB_URI',
  'CORS_ORIGIN',
  'CSRF_SECRET',
  'HTTPS_KEY_PATH',
  'HTTPS_CERT_PATH',
  'TRUST_PROXY',
  'FORZAR_HTTPS',
  'VITE_API_URL',
];

comprobar(
  variables.every((variable) => documento.includes(`\`${variable}\``)),
  'Variables de entorno',
  `${variables.length} variables documentadas`,
);

const enlacesLocales = [...documento.matchAll(/\[[^\]]+\]\((?!https?:|#)([^)]+)\)/g)]
  .map((coincidencia) => coincidencia[1].split('#')[0])
  .filter(Boolean);

for (const enlace of enlacesLocales) {
  const destino = resolve(dirname(rutaDocumento), enlace);
  const disponible = await existe(destino);
  comprobar(disponible, `Enlace ${enlace}`, disponible ? 'Existe' : 'No existe');
}

comprobar(
  documento.includes('/api-docs') && documento.includes('/api-docs.json'),
  'Swagger',
  'Se documentan la interfaz y el contrato JSON',
);

console.table(resultados);

if (process.exitCode) {
  console.error('\nLa documentación técnica tiene comprobaciones fallidas.');
} else {
  console.log('\nDocumentación técnica verificada correctamente.');
}
