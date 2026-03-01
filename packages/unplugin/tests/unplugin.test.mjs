import test from 'node:test';
import assert from 'node:assert/strict';

import { transformVueSfc } from '../dist/transform.js';
import { vboxNativePlugin } from '../dist/vite.js';

test('transformVueSfc transforms native tags globally', () => {
  const source = `<template><p color="red">Hello</p></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /v-vbox-runtime="\{ 'color': 'red' \}"/);
});

test('transformVueSfc transforms marked custom components', () => {
  const source = `<template><BaseButton vbox color="blue">Sign in</BaseButton></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /<BaseButton v-vbox-runtime:override="\{ 'color': 'blue' \}">Sign in<\/BaseButton>/);
});

test('transformVueSfc auto-transforms framework links without marker', () => {
  const source = `<template><router-link to="/" color="blue">Home</router-link></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /<router-link to="\/" v-vbox-runtime:override="\{ 'color': 'blue' \}">Home<\/router-link>/);
});

test('transformVueSfc keeps unmarked custom components untouched', () => {
  const source = `<template><BaseButton color="blue">Sign in</BaseButton></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(out, null);
});

test('transformVueSfc can parse all custom components when parseAllComponents is enabled', () => {
  const source = `<template><BaseButton color="blue">Sign in</BaseButton></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue', {
    parseAllComponents: true,
  });

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /<BaseButton v-vbox-runtime:override="\{ 'color': 'blue' \}">Sign in<\/BaseButton>/);
});

test('transformVueSfc preserves semantic attributes on media tags', () => {
  const source = `<template><v-box><img src="/a.png" width="40px" color="red" /></v-box></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /<img src="\/a\.png" v-vbox-runtime="\{ 'width': '40px', 'color': 'red' \}" \/>/);
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

test('denylisted native tags are not transformed', () => {
  const source = `<template><v-box><script type="application/json" color="red"></script><p color="blue">Hi</p></v-box></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /<script type="application\/json" color="red"><\/script>/);
  assert.match(out.code, /<p v-vbox-runtime="\{ 'color': 'blue' \}">Hi<\/p>/);
  assert.doesNotMatch(out.code, /<script[^>]*v-vbox-runtime=/);
});

test('transformVueSfc supports semantic/style override options', () => {
  const source = `<template><v-box><img src="/a.png" width="40px" /></v-box></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue', {
    forceStyleAttrs: ['src'],
    forceSemanticAttrs: ['width'],
  });

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /v-vbox-runtime="\{ 'src': '\/a\.png' \}"/);
  assert.match(out.code, /width="40px"/);
  assert.doesNotMatch(out.code, /'width':/);
});
