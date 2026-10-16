import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

function archivosJavaScript(directorio) {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(directorio, entrada.name);

    if (entrada.isDirectory()) return archivosJavaScript(ruta);
    return /\.(?:js|mjs)$/.test(entrada.name) ? [ruta] : [];
  });
}

const archivos = ['server.js', ...archivosJavaScript('src'), ...archivosJavaScript('test')];

for (const archivo of archivos) {
  execFileSync(process.execPath, ['--check', archivo], { stdio: 'inherit' });
}
