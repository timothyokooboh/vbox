import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
try {
  for (const bundler of ['vite', 'webpack']) {
    const root = path.resolve('dist', bundler);
    const server = http.createServer(async (request, response) => {
      try {
        const pathname = new URL(request.url, 'http://localhost').pathname;
        const file = path.resolve(
          root,
          `.${pathname === '/' ? '/index.html' : pathname}`,
        );
        if (!file.startsWith(`${root}/`)) throw new Error('outside consumer');
        response.setHeader(
          'Content-Type',
          file.endsWith('.js') ? 'text/javascript' : 'text/html',
        );
        response.end(await fs.readFile(file));
      } catch {
        response.writeHead(404).end();
      }
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (/hydration|mismatch/i.test(message.text()))
        errors.push(message.text());
    });
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      const button = page.locator('#probe');
      assert.equal(await button.getAttribute('translate'), 'no');
      const style = () =>
        button.evaluate((el) => {
          const s = getComputedStyle(el);
          return {
            color: s.color,
            width: s.width,
            translate: s.translate,
            padding: s.padding,
          };
        });
      assert.deepEqual(await style(), {
        color: 'rgb(18, 52, 86)',
        width: '100px',
        translate: '8px',
        padding: '16px',
      });
      await button.click();
      assert.equal((await style()).width, '120px');
      assert.equal((await style()).color, 'rgb(255, 0, 0)');
      assert.deepEqual(errors, []);
      console.log(
        `${bundler}: packed SSR/hydration, semantic collision, tokens, alias, PVA, hover and update passed`,
      );
    } finally {
      await page.close();
      await new Promise((resolve) => server.close(resolve));
    }
  }
} finally {
  await browser.close();
}
