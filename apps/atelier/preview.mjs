// Local verification server, not a production hosting service.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('./dist/', import.meta.url));
const portIndex = process.argv.indexOf('--port');
const port = portIndex < 0 ? 5178 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('Invalid port');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const file = path.resolve(
      root,
      `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`,
    );
    if (!file.startsWith(root)) return res.writeHead(403).end();
    const body = await readFile(file);
    res
      .writeHead(200, {
        'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
      })
      .end(body);
  } catch {
    res.writeHead(404).end();
  }
});
server.listen(port, '127.0.0.1');
process.on('SIGTERM', () => server.close());
