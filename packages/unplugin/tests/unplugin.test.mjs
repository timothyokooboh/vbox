import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { transformVueSfc } from '../dist/transform.js';
import { vboxVitePlugin } from '../dist/vite.js';
import { vboxWebpackLoader, vboxWebpackPlugin } from '../dist/webpack.js';

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

test('transformVueSfc transforms unmarked custom components by default', () => {
  const source = `<template><BaseButton color="blue">Sign in</BaseButton></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /<BaseButton v-vbox-runtime:override="\{ 'color': 'blue' \}">Sign in<\/BaseButton>/);
});

test('transformVueSfc keeps unmarked custom components untouched when parseAllComponents is false', () => {
  const source = `<template><BaseButton color="blue">Sign in</BaseButton></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue', {
    parseAllComponents: false,
  });

  assert.equal(out, null);
});

test('transformVueSfc preserves semantic attributes on media tags', () => {
  const source = `<template><v-box><img src="/a.png" width="40px" color="red" /></v-box></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /<img src="\/a\.png" v-vbox-runtime="\{ 'width': '40px', 'color': 'red' \}" \/>/);
  assert.doesNotMatch(out.code, /'src':/);
});

test('vite plugin delegates transform with pre-enforce', () => {
  const plugin = vboxVitePlugin();

  assert.equal(plugin.name, 'veebox-vite-transform');
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

test('transformVueSfc skips marked custom component instance with vbox-ignore', () => {
  const source = `<template><BaseButton vbox-ignore color="blue">Sign in</BaseButton></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue');

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /<BaseButton color="blue">Sign in<\/BaseButton>/);
  assert.doesNotMatch(out.code, /v-vbox-runtime/);
});

test('webpack plugin injects pre vue rule with shared loader', () => {
  const taps = [];
  const compiler = {
    options: { module: { rules: [] } },
    hooks: {
      environment: {
        tap(name, cb) {
          taps.push(name);
          cb();
        },
      },
    },
  };

  const plugin = vboxWebpackPlugin({ parseAllComponents: true });
  assert.equal(plugin.name, 'veebox-webpack-transform');
  plugin.apply(compiler);

  assert.deepEqual(taps, ['veebox-webpack-transform']);
  assert.equal(Array.isArray(compiler.options.module.rules), true);

  const rule = compiler.options.module.rules.at(-1);
  assert.equal(String(rule.test), String(/\.vue$/));
  assert.equal(rule.enforce, 'pre');
  assert.equal(typeof rule.use?.[0]?.loader, 'string');
  assert.equal(rule.use?.[0]?.options?.parseAllComponents, true);
});

test('webpack loader reuses transformVueSfc output', () => {
  const source = `<template><p color="red">Hello</p></template>`;
  const out = vboxWebpackLoader.call(
    {
      resourcePath: '/tmp/example.vue',
      getOptions() {
        return {};
      },
    },
    source,
  );

  assert.match(out, /v-vbox-runtime="\{ 'color': 'red' \}"/);
});

test('transformVueSfc auto-loads aliases from nearest vbox config', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vbox-unplugin-'));
  const vuePath = path.join(dir, 'Example.vue');
  const configPath = path.join(dir, 'vbox.config.js');
  fs.writeFileSync(
    configPath,
    `export default { aliases: { values: { glass: 'backdropFilter' } } };`,
    'utf8',
  );

  const source = `<template><section glass="blur(8px)" color="red">Hi</section></template>`;
  const out = transformVueSfc(source, vuePath);

  fs.rmSync(dir, { recursive: true, force: true });

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /'glass': 'blur\(8px\)'/);
  assert.match(out.code, /'color': 'red'/);
});

test('transformVueSfc keeps explicit aliases fallback when config path is missing', () => {
  const source = `<template><section glass="blur(8px)">Hi</section></template>`;
  const out = transformVueSfc(source, '/tmp/example.vue', {
    configPath: './not-found-vbox.config.ts',
    aliases: ['glass'],
  });

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /'glass': 'blur\(8px\)'/);
});

test('transformVueSfc explicit aliases replace auto-loaded aliases', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vbox-unplugin-'));
  const vuePath = path.join(dir, 'Example.vue');
  const configPath = path.join(dir, 'vbox.config.js');
  fs.writeFileSync(
    configPath,
    `export default { aliases: { values: { glass: 'backdropFilter' } } };`,
    'utf8',
  );

  const source = `<template><section glass="blur(8px)" borderR="10px">Hi</section></template>`;
  const out = transformVueSfc(source, vuePath, {
    aliases: ['borderR'],
  });

  fs.rmSync(dir, { recursive: true, force: true });

  assert.equal(typeof out?.code, 'string');
  assert.match(out.code, /glass="blur\(8px\)"/);
  assert.match(out.code, /'borderR': '10px'/);
  assert.doesNotMatch(out.code, /'glass': 'blur\(8px\)'/);
});

test('transformVueSfc skips node_modules vue files', () => {
  const source = `<template><div color="red">x</div></template>`;
  const out = transformVueSfc(
    source,
    '/tmp/project/node_modules/vitepress/theme/Foo.vue',
  );

  assert.equal(out, null);
});
