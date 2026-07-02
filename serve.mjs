import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4321);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=utf-8',
};

function isInsideRoot(filePath) {
  const resolved = resolve(filePath);
  return resolved === root || resolved.startsWith(root + sep);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://127.0.0.1:' + port);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';

    const safePath = normalize(pathname).replace(/^([/\\])+/, '');
    const filePath = resolve(join(root, safePath));

    if (!isInsideRoot(filePath)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    const data = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
    });
    response.end(data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('Vida no Altar preview: http://127.0.0.1:' + port + '/');
});
