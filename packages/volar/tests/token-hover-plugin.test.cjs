const test = require('node:test');
const assert = require('node:assert/strict');
const { baseParse } = require('@vue/compiler-dom');
const createPlugin = require('../src/index.cjs');

const {
  buildTokenResolutionMap,
  collectTokenHints,
  createStyleKeyMatcher,
} = createPlugin._test;

test('buildTokenResolutionMap resolves default theme tokens', () => {
  const map = buildTokenResolutionMap({});

  assert.equal(map.get('fs-xl'), '1.25rem');
  assert.equal(typeof map.get('cl-red-400'), 'string');
});

test('collectTokenHints finds static token values on native tags globally', () => {
  const ast = baseParse(`<p color="cl-brand" font-size="fs-xl">Hello</p>`);

  const map = new Map([
    ['cl-brand', '#c52341'],
    ['fs-xl', '3rem'],
  ]);

  const hints = collectTokenHints(
    ast,
    (token) => map.get(token) ?? null,
    () => true,
  );

  assert.equal(hints.length, 2);
  assert.deepEqual(
    hints.map((hint) => `${hint.token}:${hint.resolved}`),
    ['cl-brand:#c52341', 'fs-xl:3rem'],
  );
});

test('collectTokenHints supports per-element vbox marker', () => {
  const ast = baseParse(`<button vbox color="cl-brand">Save</button>`);
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 1);
  assert.equal(hints[0].token, 'cl-brand');
});

test('collectTokenHints supports token hovers directly on <v-box> props', () => {
  const ast = baseParse(`<v-box fs=\"fs-xl\" color=\"cl-brand\">Hello</v-box>`);
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'fs-xl' ? '3rem' : token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 2);
});

test('collectTokenHints supports marked custom components', () => {
  const ast = baseParse(`<BaseButton vbox color="cl-brand">Save</BaseButton>`);
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 1);
  assert.equal(hints[0].token, 'cl-brand');
});

test('collectTokenHints supports framework links without marker', () => {
  const ast = baseParse(`<router-link color="cl-brand">Home</router-link>`);
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 1);
  assert.equal(hints[0].token, 'cl-brand');
});

test('collectTokenHints ignores unmarked custom components', () => {
  const ast = baseParse(`<BaseButton color="cl-brand">Save</BaseButton>`);
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 0);
});

test('collectTokenHints supports parseAllComponents option for custom components', () => {
  const ast = baseParse(`<BaseButton color="cl-brand">Save</BaseButton>`);
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
    { parseAllComponents: true },
  );

  assert.equal(hints.length, 1);
  assert.equal(hints[0].token, 'cl-brand');
});

test('collectTokenHints works on elements with v-if and children under that branch', () => {
  const ast = baseParse(
    `<v-box><section v-if="ok" bg="cl-red-900"><p fs="fs-lg">Hello</p></section></v-box>`,
  );
  const hints = collectTokenHints(
    ast,
    (token) =>
      token === 'cl-red-900'
        ? '#7f1d1d'
        : token === 'fs-lg'
          ? '1.125rem'
          : null,
    () => true,
  );

  assert.equal(hints.some((hint) => hint.token === 'cl-red-900'), true);
  assert.equal(hints.some((hint) => hint.token === 'fs-lg'), true);
});

test('collectTokenHints works on elements with v-for', () => {
  const ast = baseParse(
    `<v-box><p v-for="user in users" fs="fs-lg" bg="cl-red-900">{{ user.name }}</p></v-box>`,
  );
  const hints = collectTokenHints(
    ast,
    (token) =>
      token === 'cl-red-900'
        ? '#7f1d1d'
        : token === 'fs-lg'
          ? '1.125rem'
          : null,
    () => true,
  );

  assert.equal(hints.some((hint) => hint.token === 'cl-red-900'), true);
  assert.equal(hints.some((hint) => hint.token === 'fs-lg'), true);
});

test('collectTokenHints finds token inside compound style values', () => {
  const ast = baseParse(
    `<v-box><p border="1px solid cl-brand">Hello</p></v-box>`,
  );
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 1);
  assert.equal(hints[0].token, 'cl-brand');
});

test('collectTokenHints finds tokens inside bound object-style props', () => {
  const ast = baseParse(
    `<v-box><div :pseudos="{ ':hover': { transform: 'translateY(-2px)', bg: 'cl-emerald-400' } }" /></v-box>`,
  );
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-emerald-400' ? 'oklch(0.765 0.177 163.223)' : null),
    () => true,
  );

  assert.equal(hints.some((hint) => hint.token === 'cl-emerald-400'), true);
});

test('collectTokenHints skips denylisted native tags even with marker', () => {
  const ast = baseParse(
    `<v-box><script vbox color="cl-brand"></script><p color="cl-brand">Hello</p></v-box>`,
  );
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 1);
  assert.equal(hints[0].token, 'cl-brand');
});

test('style key matcher excludes semantic attributes', () => {
  const isStyleKey = createStyleKeyMatcher({});

  assert.equal(isStyleKey('img', 'src'), false);
  assert.equal(isStyleKey('a', 'href'), false);
  assert.equal(isStyleKey('p', 'color'), true);
  assert.equal(isStyleKey('section', 'max-w'), true);
});

test('style key matcher supports semantic/style overrides', () => {
  const isStyleKey = createStyleKeyMatcher(
    {},
    {
      forceStyleAttrs: ['src'],
      forceSemanticAttrs: ['width'],
    },
  );

  assert.equal(isStyleKey('img', 'src'), true);
  assert.equal(isStyleKey('img', 'width'), false);
});
