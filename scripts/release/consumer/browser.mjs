import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium } from '@playwright/test';
const readStyles = (button) =>
  button.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      color: s.color,
      width: s.width,
      translate: s.translate,
      padding: s.padding,
    };
  });

const initialStyle = {
  color: 'rgb(18, 52, 86)',
  width: '100px',
  translate: '8px',
  padding: '16px',
};
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
      const cold = await browser.newPage({ javaScriptEnabled: false });
      try {
        await cold.goto(`http://127.0.0.1:${server.address().port}`);
        assert.deepEqual(
          await readStyles(cold.locator('#probe')),
          initialStyle,
          `${bundler}: critical CSS without client JavaScript`,
        );
      } finally {
        await cold.close();
      }
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      const button = page.locator('#probe');
      assert.equal(await button.getAttribute('translate'), 'no');
      assert.deepEqual(await readStyles(button), initialStyle);
      await button.click();
      assert.equal((await readStyles(button)).width, '120px');
      assert.equal((await readStyles(button)).color, 'rgb(255, 0, 0)');
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
