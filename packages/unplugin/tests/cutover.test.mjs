import test from 'node:test';
import assert from 'node:assert/strict';
import { transformVueSfc } from '../dist/transform.js';

test('a file without explicit styling keeps every ordinary native and component binding semantic', () => {
  const source = `<template>
    <button translate="no" color="red" width="20" :size="size">Save</button>
    <AppButton color="blue" :hover="options" v-bind="props" />
    <router-link to="/" color="green">Home</router-link>
    <svg><rect fill="red" width="20" /></svg>
    <v-box color="purple"><p color="orange">Published VBox only</p></v-box>
  </template>`;
  const out = transformVueSfc(source, '/project/Plain.vue');
  assert.equal(out?.code ?? source, source);
});

test('retired inference options give actionable migration errors instead of reviving inference', () => {
  for (const option of [
    'parseAllComponents',
    'forceStyleAttrs',
    'forceSemanticAttrs',
  ]) {
    assert.throws(
      () =>
        transformVueSfc(
          '<template><p color="red" /></template>',
          '/project/View.vue',
          { [option]: false },
        ),
      (error) =>
        error.message.includes(option) && error.message.includes('vb-'),
    );
  }
});

test('retired markers are advisory only and cannot opt into or suppress explicit styling', () => {
  const source =
    '<template><p vbox color="red"/><AppButton vbox-ignore vb-color="blue"/><span vboxignore /></template>';
  const out = transformVueSfc(source, '/project/Markers.vue');
  assert.ok(out.code.includes('color="red"'));
  assert.ok(!out.code.includes('vb-color='));
  assert.equal(out.warnings.length, 3);
  for (const warning of out.warnings) {
    assert.match(warning.message, /retired.*vb-/);
    assert.ok(warning.loc.offset >= source.indexOf('<p'));
  }
});

test('unknown namespaced properties remain styling with source-located advisory guidance', () => {
  const source =
    '<template>\n  <p vb-colro="red" vb-future-property="yes" />\n</template>';
  const out = transformVueSfc(source, '/project/Unknown.vue');
  assert.equal(out.warnings.length, 2);
  assert.ok(!out.code.includes('vb-colro='));
  assert.match(out.warnings[0].message, /Unrecognized.*colro.*styling/);
  assert.equal(out.warnings[0].loc.line, 2);
  assert.equal(out.warnings[0].loc.offset, source.indexOf('vb-colro'));
});

test('recognized CSS, custom properties, aliases, and legacy conditions do not produce spelling warnings', () => {
  const source = `<template><p vb-color="red" vbMaxW="20rem" vb---accent="red"
    :vb-_disabled="{ color: 'gray' }" /><p :vb-disabled="{ color: 'gray' }"
    :vb-_2xl="{ color: 'blue' }" /><p :vb-2xl="{ color: 'blue' }"
    vb-border-r="2px" /></template>`;
  const out = transformVueSfc(source, '/project/Recognized.vue', {
    aliases: ['borderR'],
  });
  assert.deepEqual(out.warnings, []);
});

test('literal regions do not trigger migration or spelling advisories', () => {
  const source =
    '<template><div v-pre><p vbox vb-colro="red" /></div></template>';
  const out = transformVueSfc(source, '/project/Literal.vue');
  assert.equal(out?.code ?? source, source);
  assert.deepEqual(out?.warnings ?? [], []);
});
