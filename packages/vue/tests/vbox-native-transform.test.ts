import { describe, expect, test } from 'vitest';
import { transformVueSfc } from '../../unplugin/src/transform.ts';

describe('native vbox template transform', () => {
  test('legacy explicit marker transforms static style attributes', () => {
    const source = `<template><p vbox color="red" width="250px">Hello</p></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`<p v-vbox-runtime="{ 'color': 'red', 'width': '250px' }">Hello</p>`);
    expect(out?.code).not.toContain(' vbox');
  });

  test('auto-transforms native children inside <v-box> scope', () => {
    const source = `<template><v-box><p color="red">Hello</p></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain('<v-box>');
    expect(out?.code).toContain(`<p v-vbox-runtime="{ 'color': 'red' }">Hello</p>`);
  });

  test('auto-transforms deeply nested native descendants in scope', () => {
    const source = `<template><v-box><section width="350px"><h2 border-radius="10px">Subtitle</h2></section></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`<section v-vbox-runtime="{ 'width': '350px' }">`);
    expect(out?.code).toContain(`<h2 v-vbox-runtime="{ 'border-radius': '10px' }">Subtitle</h2>`);
  });

  test('supports bound style attributes in scoped mode', () => {
    const source = `<template><v-box><p :color="tone" :width="w">Hello</p></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`'color': (tone)`);
    expect(out?.code).toContain(`'width': (w)`);
  });

  test('supports v-bind object spread in scoped mode', () => {
    const source = `<template><v-box><button v-bind="buttonStyles">Login</button></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(
      `<button v-bind="buttonStyles" v-vbox-runtime="{ ...(buttonStyles) }">Login</button>`,
    );
  });

  test('supports v-bind object spread with explicit vbox marker', () => {
    const source = `<template><button vbox v-bind="buttonStyles">Login</button></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(
      `<button v-bind="buttonStyles" v-vbox-runtime="{ ...(buttonStyles) }">Login</button>`,
    );
  });

  test('preserves attribute order semantics for v-bind spread and explicit style attrs', () => {
    const source = `<template><v-box><button v-bind="buttonStyles" color="red">Login</button></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(
      `v-vbox-runtime="{ ...(buttonStyles), 'color': 'red' }"`,
    );
  });

  test('supports kebab-case form of default camelCase aliases', () => {
    const source = `<template><v-box><section max-w="420px">Hello</section></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`v-vbox-runtime="{ 'max-w': '420px' }"`);
  });

  test('supports css custom properties', () => {
    const source = `<template><v-box><p --my-color="red">Hello</p></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`'--my-color': 'red'`);
  });

  test('supports bound object style keys in scoped mode', () => {
    const source = `<template><v-box><p :hover="{ color: 'white' }" :mq="queries">Hello</p></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`'hover': ({ color: 'white' })`);
    expect(out?.code).toContain(`'mq': (queries)`);
  });

  test('keeps semantic attributes on native elements', () => {
    const source = `<template><v-box><button aria-label="save" role="button" color="red">Save</button></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain('aria-label="save"');
    expect(out?.code).toContain('role="button"');
    expect(out?.code).toContain(`'color': 'red'`);
  });

  test('keeps on* attributes untransformed', () => {
    const source = `<template><v-box><button onclick="doThing()">Save</button></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out).toBeNull();
  });

  test('keeps non-style directives untouched in scoped mode', () => {
    const source = `<template><v-box><p v-if="ok" @click="tap" color="red">Hello</p></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain('v-if="ok"');
    expect(out?.code).toContain('@click="tap"');
    expect(out?.code).toContain(`'color': 'red'`);
  });

  test('does not transform custom components inside scope', () => {
    const source = `<template><v-box><MyCard color="red" /></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out).toBeNull();
  });

  test('does not transform non-visual resource tags inside scope', () => {
    const source = `<template><v-box><script type="application/json" color="red"></script><p color="blue">Hi</p></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`<script type="application/json" color="red"></script>`);
    expect(out?.code).toContain(`<p v-vbox-runtime="{ 'color': 'blue' }">Hi</p>`);
    expect(out?.code).not.toContain(`<script type="application/json" v-vbox-runtime`);
  });

  test('explicit vbox marker does not force transform on denylisted tags', () => {
    const source = `<template><script vbox type="application/json" color="red"></script></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`<script type="application/json" color="red"></script>`);
    expect(out?.code).not.toContain(`v-vbox-runtime`);
    expect(out?.code).not.toContain(`vbox`);
  });

  test('auto-transforms router-link without marker', () => {
    const source = `<template><router-link color="red" to="/">go</router-link></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(
      `<router-link to="/" v-vbox-runtime="{ 'color': 'red' }">go</router-link>`,
    );
  });

  test('auto-transforms nuxt-link without marker', () => {
    const source = `<template><nuxt-link color="red" to="/">go</nuxt-link></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(
      `<nuxt-link to="/" v-vbox-runtime="{ 'color': 'red' }">go</nuxt-link>`,
    );
  });

  test('parseAllComponents transforms unmarked custom components when enabled', () => {
    const source = `<template><MyCard color="red" /></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue', {
      parseAllComponents: true,
    });

    expect(out?.code).toContain(`<MyCard v-vbox-runtime="{ 'color': 'red' }" />`);
  });

  test('supports self-closing tags in scoped mode', () => {
    const source = `<template><v-box><img src="/a.png" width="48px" color="red" /></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`<img src="/a.png" v-vbox-runtime="{ 'width': '48px', 'color': 'red' }" />`);
    expect(out?.code).not.toContain(`'src':`);
  });

  test('does not treat semantic media/link attributes as style props', () => {
    const source = `<template><v-box><img src="/a.png" alt="Preview" /><a href="/docs" target="_blank" rel="noopener" color="red">Docs</a></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`<img src="/a.png" alt="Preview" />`);
    expect(out?.code).toContain(
      `<a href="/docs" target="_blank" rel="noopener" v-vbox-runtime="{ 'color': 'red' }">Docs</a>`,
    );
    expect(out?.code).not.toContain(`'alt':`);
    expect(out?.code).not.toContain(`'href':`);
    expect(out?.code).not.toContain(`'target':`);
    expect(out?.code).not.toContain(`'rel':`);
  });

  test('treats input size as style key so width/size attrs can style form controls', () => {
    const source = `<template><v-box><input size="12" color="red" /></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`<input v-vbox-runtime="{ 'size': '12', 'color': 'red' }" />`);
  });

  test('treats svg semantic attrs as non-style', () => {
    const source = `<template><v-box><svg viewBox="0 0 100 100"><path d="M10 10 L90 90" stroke="red" /></svg></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`<svg viewBox="0 0 100 100">`);
    expect(out?.code).toContain(`<path d="M10 10 L90 90" v-vbox-runtime="{ 'stroke': 'red' }" />`);
    expect(out?.code).not.toContain(`'d':`);
  });

  test('forceStyleAttrs can override semantic classification', () => {
    const source = `<template><v-box><img src="/hero.png" /></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue', {
      forceStyleAttrs: ['src'],
    });

    expect(out?.code).toContain(`v-vbox-runtime="{ 'src': '/hero.png' }"`);
  });

  test('forceSemanticAttrs can override style classification', () => {
    const source = `<template><v-box><p color="red" fs="fs-lg">Hello</p></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue', {
      forceSemanticAttrs: ['color'],
    });

    expect(out?.code).toContain(`<p color="red" v-vbox-runtime="{ 'fs': 'fs-lg' }">Hello</p>`);
  });

  test('recognizes custom alias when passed through plugin options', () => {
    const source = `<template><v-box><h2 borderR="10px">Subtitle</h2></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue', {
      aliases: ['borderR'],
    });

    expect(out?.code).toContain(`'borderR': '10px'`);
  });

  test('recognizes kebab-case form of custom alias when passed through plugin options', () => {
    const source = `<template><v-box><h2 border-r="10px">Subtitle</h2></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue', {
      aliases: ['borderR'],
    });

    expect(out?.code).toContain(`'border-r': '10px'`);
  });

  test('does not recognize custom alias when not passed through options', () => {
    const source = `<template><v-box><h2 borderR="10px">Subtitle</h2></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out).toBeNull();
  });

  test('rejects non-bound object style keys in scoped mode', () => {
    const source = `<template><v-box><p hover="{ color: 'white' }">Hello</p></v-box></template>`;

    expect(() => transformVueSfc(source, '/tmp/example.vue')).toThrow(
      'must use a bound expression',
    );
  });

  test('rejects string bound object style keys in scoped mode', () => {
    const source = `<template><v-box><p :hover="'{ color: white }'">Hello</p></v-box></template>`;

    expect(() => transformVueSfc(source, '/tmp/example.vue')).toThrow(
      'must be a non-string bound object expression',
    );
  });

  test('vbox-ignore prevents transform on element and subtree', () => {
    const source = `<template><v-box><section vbox-ignore width="350px"><h2 color="red">Subtitle</h2></section></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain('<section width="350px">');
    expect(out?.code).toContain('<h2 color="red">Subtitle</h2>');
    expect(out?.code).not.toContain('v-vbox-runtime');
    expect(out?.code).not.toContain('vbox-ignore');
  });

  test('nested v-box scopes are supported', () => {
    const source = `<template><v-box><article color="red"><v-box><p width="100px">Inner</p></v-box></article></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`<article v-vbox-runtime="{ 'color': 'red' }">`);
    expect(out?.code).toContain(`<p v-vbox-runtime="{ 'width': '100px' }">Inner</p>`);
  });

  test('keeps explicit vbox marker outside scope', () => {
    const source = `<template><p vbox color="red">Hello</p></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain(`v-vbox-runtime="{ 'color': 'red' }"`);
  });

  test('returns null when file is not vue', () => {
    const source = `<template><v-box><p color="red">Hello</p></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.ts');
    expect(out).toBeNull();
  });

  test('returns null when no template block exists', () => {
    const source = `<script setup>const a = 1</script>`;
    const out = transformVueSfc(source, '/tmp/example.vue');
    expect(out).toBeNull();
  });

  test('auto-transforms native tags globally without scope marker', () => {
    const source = `<template><p color="red">Hello</p></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');
    expect(out?.code).toContain(`<p v-vbox-runtime="{ 'color': 'red' }">Hello</p>`);
  });

  test('keeps unmarked custom components untouched', () => {
    const source = `<template><BaseButton color="blue">Sign in</BaseButton></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');
    expect(out).toBeNull();
  });

  test('transforms marked custom components', () => {
    const source = `<template><BaseButton vbox color="blue" fs="1.2rem">Sign in</BaseButton></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');
    expect(out?.code).toContain(
      `<BaseButton v-vbox-runtime="{ 'color': 'blue', 'fs': '1.2rem' }">Sign in</BaseButton>`,
    );
  });

  test('supports comments and preserves content around transformed tags', () => {
    const source = `<template><!--before--><v-box><p color="red">Hello</p><!--after--></v-box></template>`;
    const out = transformVueSfc(source, '/tmp/example.vue');

    expect(out?.code).toContain('<!--before-->');
    expect(out?.code).toContain(`v-vbox-runtime="{ 'color': 'red' }"`);
    expect(out?.code).toContain('<!--after-->');
  });
});
