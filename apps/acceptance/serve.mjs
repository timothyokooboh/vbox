import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { driverPorts } from './drivers.mjs';

const driver = process.argv[2];
if (!Object.hasOwn(driverPorts, driver))
  throw new Error('Expected vite or webpack');
const renderer = await import(driver === 'webpack' ? './dist/server-webpack/entry-server.cjs' : './dist/server/entry-server.js');
const render = renderer.render ?? renderer.default.render;
const root = path.resolve(
  fileURLToPath(new URL(`./dist/${driver}/`, import.meta.url)),
);
const port = driverPorts[driver];
const mime = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const file = path.resolve(
      root,
      `.${url.pathname === '/' ? '/index.html' : url.pathname}`,
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    let body = await readFile(file);
    if (url.pathname === '/' && url.searchParams.has('ssr')) {
      const fixture = url.searchParams.get('fixture') === 'hydration' ? 'hydration' : 'standard';
      const { html, css } = await render(fixture);
      body = body
        .toString()
        .replace('<html ', `<html data-ssr data-fixture="${fixture}" ${url.searchParams.get('theme') === 'dark' ? 'class="dark" ' : ''}`)
        .replace('<!--ssr-head-->', `<style>${css}</style>`)
        .replace('<!--ssr-body-->', html);
    }
    res
      .writeHead(200, {
        'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream',
      })
      .end(body);
  } catch (error) {
    const notFound = error.code === 'ENOENT';
    if (!notFound) console.error(error);
    res.writeHead(notFound ? 404 : 500).end();
  }
});
server.listen(port, '127.0.0.1');
process.on('SIGTERM', () => server.close());
