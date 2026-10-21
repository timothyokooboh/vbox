import test from 'node:test';
import assert from 'node:assert/strict';
import { transformVueSfc } from '../dist/transform.js';
import { vboxVitePlugin } from '../dist/vite.js';
import { vboxWebpackLoader, vboxWebpackPlugin } from '../dist/webpack.js';

for (const tag of ['p', 'BaseButton', 'router-link', 'path']) {
  test(`explicit styling works on ${tag} without changing ordinary props`, () => {
    const source = `<template><${tag} color="semantic" vb-color="red" /></template>`;
    const out = transformVueSfc(source, '/project/View.vue');
    assert.ok(out.code.includes('color="semantic"'));
    assert.ok(!out.code.includes('vb-color='));
    assert.ok(out.map);
  });
}

test('vite plugin delegates the explicit transform and reports advisory guidance', () => {
  const plugin = vboxVitePlugin();
  assert.equal(plugin.name, 'veebox-vite-transform');
  assert.equal(plugin.enforce, 'pre');
  const warnings = [];
  const source = '<template><p vb-colro="red" /></template>';
  const out = plugin.transform.call(
    { warn: (message) => warnings.push(message) },
    source,
    '/project/View.vue',
  );
  assert.ok(out.map);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Unrecognized.*colro/);
});

test('webpack plugin installs the shared loader with explicit alias metadata', () => {
  const compiler = {
    options: { module: { rules: [] } },
    hooks: {
      environment: {
        tap(_name, callback) {
          callback();
        },
      },
    },
  };
  const plugin = vboxWebpackPlugin({ aliases: ['surface'] });
  plugin.apply(compiler);
  const rule = compiler.options.module.rules.find(
    (item) => item.enforce === 'pre',
  );
  assert.equal(String(rule.test), String(/\.vue$/));
  assert.deepEqual(rule.use[0].options.aliases, ['surface']);
});

test('webpack loader preserves semantic bindings and exposes the same advisory', () => {
  const warnings = [];
  const source = '<template><p color="semantic" vb-colro="red" /></template>';
  const out = vboxWebpackLoader.call(
    {
      resourcePath: '/project/View.vue',
      emitWarning: (warning) => warnings.push(warning),
    },
    source,
  );
  assert.ok(out.includes('color="semantic"'));
  assert.ok(!out.includes('vb-colro='));
  assert.equal(warnings.length, 1);
  assert.match(warnings[0].message, /Unrecognized.*colro/);
});

test('third-party and Vue language-block requests stay outside the SFC transform', () => {
  for (const id of [
    '/project/node_modules/library/View.vue',
    '/project/View.vue?vue&type=template',
    '/project/file.ts',
  ])
    assert.equal(
      transformVueSfc('<template><p vb-color="red" /></template>', id),
      null,
    );
});
