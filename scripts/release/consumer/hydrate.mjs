import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { render as renderVite } from './dist/server/server.js';
const { render: renderWebpack } = createRequire(import.meta.url)(
  './dist/server-webpack/server.cjs',
);
for (const [bundler, render] of [
  ['vite', renderVite],
  ['webpack', renderWebpack],
]) {
  const result = await render();
  if (!result.css || !result.html.includes('translate="no"'))
    throw new Error(`${bundler}: packed SSR lost styles or semantics`);
  const file = `dist/${bundler}/index.html`;
  const html = await fs.readFile(file, 'utf8');
  await fs.writeFile(
    file,
    html
      .replace('</head>', `<style>${result.css}</style></head>`)
      .replace('<div id="app"></div>', `<div id="app">${result.html}</div>`),
  );
}
