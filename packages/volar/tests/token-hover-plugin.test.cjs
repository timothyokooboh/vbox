const test = require('node:test');
const assert = require('node:assert/strict');
const { baseParse } = require('@vue/compiler-dom');
const createPlugin = require('../src/index.cjs');

const {
  buildTokenResolutionMap,
  collectTokenHints,
  collectCompletionHints,
  buildCompletionCode,
  buildTokenPrefixByProperty,
  buildAttrCompletionKeys,
  getTokenCandidatesForKey,
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
    (token) =>
      token === 'fs-xl' ? '3rem' : token === 'cl-brand' ? '#c52341' : null,
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

test('collectTokenHints supports unmarked custom components by default', () => {
  const ast = baseParse(`<BaseButton color="cl-brand">Save</BaseButton>`);
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 1);
  assert.equal(hints[0].token, 'cl-brand');
});

test('collectTokenHints supports custom component hovers without compiler opt-in', () => {
  const ast = baseParse(`<BaseButton color="cl-brand">Save</BaseButton>`);
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 1);
  assert.equal(hints[0].token, 'cl-brand');
});

test('collectTokenHints still shows custom component hovers with vbox-ignore', () => {
  const ast = baseParse(
    `<BaseButton vbox-ignore color="cl-brand">Save</BaseButton>`,
  );
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
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

  assert.equal(
    hints.some((hint) => hint.token === 'cl-red-900'),
    true,
  );
  assert.equal(
    hints.some((hint) => hint.token === 'fs-lg'),
    true,
  );
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

  assert.equal(
    hints.some((hint) => hint.token === 'cl-red-900'),
    true,
  );
  assert.equal(
    hints.some((hint) => hint.token === 'fs-lg'),
    true,
  );
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
    (token) =>
      token === 'cl-emerald-400' ? 'oklch(0.765 0.177 163.223)' : null,
    () => true,
  );

  assert.equal(
    hints.some((hint) => hint.token === 'cl-emerald-400'),
    true,
  );
});

test('collectTokenHints explains attribute tokens independently of compiler tag exclusions', () => {
  const ast = baseParse(
    `<v-box><script vbox color="cl-brand"></script><p color="cl-brand">Hello</p></v-box>`,
  );
  const hints = collectTokenHints(
    ast,
    (token) => (token === 'cl-brand' ? '#c52341' : null),
    () => true,
  );

  assert.equal(hints.length, 2);
  assert.equal(hints[0].token, 'cl-brand');
});

test('style vocabulary recognizes explicit CSS, aliases, and conditions without semantic inference', () => {
  const known = createStyleKeyMatcher({});
  for (const key of [
    'color',
    'max-w',
    'translate',
    'src',
    'width',
    '--accent',
    '_disabled',
    'disabled',
    '_2xl',
    '2xl',
  ]) {
    assert.equal(known('img', key), true, key);
  }
  assert.equal(known('p', 'colro'), false);
});

test('retired editor inference options give actionable migration errors', () => {
  for (const key of [
    'parseAllComponents',
    'forceStyleAttrs',
    'forceSemanticAttrs',
  ]) {
    assert.throws(
      () => createPlugin({ config: { [key]: false } }),
      /removed.*vb-/,
    );
  }
});

test('buildAttrCompletionKeys explicit aliases replace config aliases', () => {
  const keys = buildAttrCompletionKeys(
    { aliases: { values: { glass: 'backdropFilter' } } },
    [],
    { aliases: ['borderR'] },
  );

  assert.equal(keys.includes('borderR'), true);
  assert.equal(keys.includes('glass'), false);
});

test('collectCompletionHints returns style attr and token value hints', () => {
  const ast = baseParse(`<p vb-color=\"cl-brand\" vb-fs=\"fs-lg\">Hello</p>`);
  const tokenMap = new Map([
    ['cl-brand', '#c52341'],
    ['cl-red-400', '#f87171'],
    ['fs-lg', '1.125rem'],
    ['fs-xl', '1.25rem'],
  ]);
  const prefixMap = buildTokenPrefixByProperty({});
  const cache = new Map();
  const hints = collectCompletionHints(
    ast,
    () => true,
    (key) => getTokenCandidatesForKey(key, tokenMap, prefixMap, cache),
    {},
  );

  assert.equal(
    hints.attrHints.some((hint) => hint.value === 'vb-color'),
    true,
  );
  assert.equal(
    hints.attrHints.some((hint) => hint.value === 'vb-fs'),
    true,
  );
  assert.equal(
    hints.valueHints.some((hint) => hint.typedValue === 'cl-brand'),
    true,
  );
  assert.equal(
    hints.valueHints.some((hint) => hint.typedValue === 'fs-lg'),
    true,
  );
});

test('buildCompletionCode emits mapped completion segments', () => {
  const code = buildCompletionCode(
    [{ value: 'color', offset: 10, length: 5 }],
    [
      {
        typedValue: 'cl-brand',
        mappedValue: 'cl-brand',
        offset: 20,
        candidates: ['cl-brand', 'cl-red-400'],
      },
    ],
    buildAttrCompletionKeys({}),
    50,
  );

  assert.equal(code.length > 0, true);
  assert.equal(
    code.some(
      (part) =>
        typeof part === 'string' && part.includes('__vboxAttrCompletion'),
    ),
    true,
  );
  assert.equal(
    code.some(
      (part) =>
        typeof part === 'string' && part.includes('__vboxTokenCompletion'),
    ),
    true,
  );
});

test('buildAttrCompletionKeys includes broad css properties', () => {
  const keys = buildAttrCompletionKeys({});
  assert.equal(keys.includes('backdrop-filter'), true);
  assert.equal(keys.includes('text-transform'), true);
});

test('collectCompletionHints includes empty quoted value context for token completion', () => {
  const ast = baseParse(`<h1 vb-font-size=\"\">Hello</h1>`);
  const tokenMap = new Map([
    ['fs-lg', '1.125rem'],
    ['fs-xl', '1.25rem'],
    ['cl-brand', '#c52341'],
  ]);
  const prefixMap = buildTokenPrefixByProperty({});
  const cache = new Map();
  const hints = collectCompletionHints(
    ast,
    () => true,
    (key, typedPrefix) =>
      getTokenCandidatesForKey(key, tokenMap, prefixMap, cache, typedPrefix),
    {},
  );

  assert.equal(hints.valueHints.length > 0, true);
  const emptyHint = hints.valueHints[0];
  assert.equal(emptyHint.typedValue, '');
  assert.equal(emptyHint.mappedValue, '');
  assert.deepEqual(emptyHint.candidates, ['fs-lg', 'fs-xl']);
});

test('getTokenCandidatesForKey narrows tokens by property prefix mapping', () => {
  const tokenMap = new Map([
    ['cl-brand', '#c52341'],
    ['cl-red-400', '#f87171'],
    ['fs-lg', '1.125rem'],
    ['fs-xl', '1.25rem'],
    ['br-md', '0.5rem'],
  ]);
  const prefixMap = buildTokenPrefixByProperty({});
  const cache = new Map();

  const forFontSize = getTokenCandidatesForKey(
    'font-size',
    tokenMap,
    prefixMap,
    cache,
  );
  assert.deepEqual(forFontSize, ['fs-lg', 'fs-xl']);

  const forBorderColor = getTokenCandidatesForKey(
    'border-color',
    tokenMap,
    prefixMap,
    cache,
  );
  assert.deepEqual(forBorderColor, ['cl-brand', 'cl-red-400']);
});

test('getTokenCandidatesForKey prefers typed token prefix over property fallback', () => {
  const tokenMap = new Map([
    ['cl-brand', '#c52341'],
    ['cl-red-400', '#f87171'],
    ['fs-lg', '1.125rem'],
    ['fs-xl', '1.25rem'],
  ]);
  const prefixMap = buildTokenPrefixByProperty({});
  const cache = new Map();

  const fromTypedPrefix = getTokenCandidatesForKey(
    'font-size',
    tokenMap,
    prefixMap,
    cache,
    'cl',
  );

  assert.deepEqual(fromTypedPrefix, ['cl-brand', 'cl-red-400']);
});
