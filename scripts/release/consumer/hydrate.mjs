import fs from 'node:fs/promises';
import { render } from './dist/server/server.js';
const result = await render();
if (!result.css || !result.html.includes('translate="no"'))
  throw new Error('Packed SSR lost styles or semantic bindings');
for (const bundler of ['vite', 'webpack']) {
  const file = `dist/${bundler}/index.html`;
  const html = await fs.readFile(file, 'utf8');
  await fs.writeFile(
    file,
    html
      .replace('</head>', `<style>${result.css}</style></head>`)
      .replace('<div id="app"></div>', `<div id="app">${result.html}</div>`),
  );
}
