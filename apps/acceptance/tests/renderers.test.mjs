import test from 'node:test';
import assert from 'node:assert/strict';

test('independent Vite and webpack SSR builds produce the same critical styling without browser globals', async () => {
  const vite = await import('../dist/server/entry-server.js');
  const webpack = await import('../dist/server-webpack/entry-server.cjs');
  const viteResult = await vite.render();
  const webpackResult = await (webpack.render ?? webpack.default.render)();
  for (const result of [viteResult, webpackResult]) {
    assert.match(result.html, /data-testid="owner-button"/);
    assert.match(result.html, /data-testid="fragment-target"/);
    assert.match(result.css, /box-sizing:border-box/);
    assert.match(result.css, /--color-brand:#123456/);
  }
  assert.equal(webpackResult.css, viteResult.css);
});
