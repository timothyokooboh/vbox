import test from 'node:test';
import assert from 'node:assert/strict';

import { transformVueSfc } from '../dist/transform.js';
import { vboxNativePlugin } from '../dist/vite.js';

test('transformVueSfc transforms native child attributes inside v-box scope', () => {
  const source = `<template><v-box><p color="red">Hello</p></v-box></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /v-vbox-runtime="\{ 'color': 'red' \}"/);
});

test('transformVueSfc preserves semantic attributes on media tags', () => {
  const source = `<template><v-box><img src="/a.png" width="40px" /></v-box></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /<img src="\/a\.png" v-vbox-runtime="\{ 'width': '40px' \}" \/>/);
  assert.doesNotMatch(out.code, /'src':/);
});

test('vite plugin delegates transform with pre-enforce', () => {
  const plugin = vboxNativePlugin();

  assert.equal(plugin.name, 'veebox-native-vbox-transform');
  assert.equal(plugin.enforce, 'pre');

  const out = plugin.transform(
    `<template><v-box><section color="blue">A</section></v-box></template>`,
    '/tmp/example.vue',
  );

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /'color': 'blue'/);
});
