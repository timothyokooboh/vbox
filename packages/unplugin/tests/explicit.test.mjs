import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, compileTemplate, compileScript } from '@vue/compiler-sfc';
import { transformVueSfc } from '../dist/transform.js';

const transform = (template) =>
  transformVueSfc(`<template>${template}</template>`, '/project/Example.vue');

test('object style bindings require a Vue expression, not an object-looking string', () => {
  assert.throws(
    () => transform(`<button vb-hover="{ color: 'red' }" />`),
    /vb-hover.*:vb-hover/,
  );
});

test('v-pre regions stay literal while their siblings are styled', () => {
  const literal = `<div v-pre vb-color="red"><p :vb-width="missing">{{ missing }}</p></div>`;
  const source = `<template>${literal}<p vb-color="blue">Styled</p></template>`;
  assert.ok(
    transformVueSfc(source, '/project/Literal.vue').code.includes(literal),
  );
});

test('unsupported binding modifiers receive actionable diagnostics', () => {
  assert.throws(
    () => transform(`<p :vb-color.prop="color" />`),
    /modifier.*remove/i,
  );
});

test('normalized duplicate bindings and missing property names are rejected', () => {
  assert.throws(
    () => transform('<p vb-color="red" vbColor="blue" />'),
    /duplicate.*color/i,
  );
  assert.throws(() => transform('<p vb-="red" />'), /property name/i);
});

test('non-rendering template and slot targets are diagnosed', () => {
  for (const tag of ['template', 'slot']) {
    assert.throws(
      () => transform(`<${tag} vb-color="red" />`),
      /rendered element/i,
    );
  }
});

test('detectable prefixed keys in ordinary spreads receive guidance without interception', () => {
  const spread = `v-bind="{ 'vb-color': 'red' }"`;
  const out = transform(`<p ${spread} vb-width="20px" />`);
  assert.ok(out.code.includes("'vb-color': 'red'"));
  assertVueCompiles(out.code);
  assert.match(out.warnings?.[0]?.message ?? '', /:vb/);
});

test('Vite subrequests are never treated as authored SFCs', () => {
  assert.equal(
    transformVueSfc(
      '<template><p vb-color="red" /></template>',
      '/project/App.vue?vue&type=script',
    ),
    null,
  );
});

function assertVueCompiles(source) {
  const { descriptor, errors } = parse(source);
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: 'public-consumer' });
  const compiled = compileTemplate({
    source: descriptor.template.content,
    filename: '/project/Example.vue',
    id: 'public-consumer',
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(compiled.errors, []);
  return descriptor;
}

test('script expressions, styles, and custom blocks survive the template transform', () => {
  const source = `<script setup lang="ts">const text = '<template>not a template</template>'; const color = 'red';</script>
<template><div><template v-if="text"><p :vb-color="color" /></template><p vb-width="10px" /></div></template>
<style scoped>.example::before { content: '<template>'; }</style>
<docs>{"example":"vb-color"}</docs>`;
  const before = parse(source).descriptor;
  const out = transformVueSfc(source, '/project/Example.vue');
  const after = assertVueCompiles(out.code);
  assert.ok(after.scriptSetup.content.includes(before.scriptSetup.content));
  assert.equal(after.styles[0].content, before.styles[0].content);
  assert.equal(after.customBlocks[0].content, before.customBlocks[0].content);
  assert.deepEqual(out.map.sourcesContent, [source]);
  assert.ok(out.map.mappings.length > 0);
});

test('generated imports avoid existing identifiers and shorthand bindings retain Vue meaning', () => {
  const source = `<script setup lang="ts">const __vboxStyles = 1; const __vboxStyles2 = 2; const vbColor = 'red';</script><template><p :vb-color>{{ __vboxStyles + __vboxStyles2 }}</p></template>`;
  assertVueCompiles(transformVueSfc(source, '/project/Example.vue').code);
});

test('ordinary Options API scripts retain their own default export and TypeScript language', () => {
  const source = `<script lang="ts">export default { data: () => ({ color: 'red' }) };</script><template><p :vb-color="color">Options API</p></template>`;
  const out = transformVueSfc(source, '/project/Example.vue');
  assertVueCompiles(out.code);
  assert.equal(
    parse(out.code).descriptor.script.content,
    parse(source).descriptor.script.content,
  );
});

test('exact prefix recognition preserves similar semantic names and future CSS intent', () => {
  const out = transform(
    '<p vbcolor="semantic" vbox-color="semantic" data-vb-color="semantic" vb-unknown-future-css="enabled" />',
  );
  const props = parse(out.code).descriptor.template.ast.children[0].props;
  for (const name of ['vbcolor', 'vbox-color', 'data-vb-color'])
    assert.ok(props.some((prop) => prop.name === name));
  assert.ok(!props.some((prop) => prop.name === 'vb-unknown-future-css'));
  assertVueCompiles(out.code);
});

test('quoted values and expressions containing HTML entities remain valid Vue expressions', () => {
  const out = transform(
    `<p vb-content="&quot;Hello &amp; goodbye&quot;" :vb-color="true ? 'red' : 'blue'" />`,
  );
  assertVueCompiles(out.code);
});

test('known object keys share core metadata, including compatibility spellings', () => {
  for (const name of [
    'vb-mq',
    'vb-cq',
    'vb-dark',
    'vb-pseudos',
    'vb-focus-visible',
    'vb-disabled',
    'vb-_disabled',
    'vb-2xl',
    'vb-_2xl',
  ]) {
    assert.throws(
      () => transform(`<p ${name}="{}" />`),
      /requires an object binding/,
    );
  }
});

test('literal dynamic prefixed names are warned about but left as ordinary bindings', () => {
  const binding = `:['vb-color']="'red'"`;
  const out = transform(`<p ${binding} vb-width="20px" />`);
  assert.ok(out.code.includes(binding));
  assert.match(out.warnings[0].message, /:vb/);
});

test('v-pre detection does not mistake attribute values or text for directive boundaries', () => {
  const out = transform(
    '<p title=" v-pre vb-color" vb-color="red"> v-pre </p>',
  );
  const attrs = parse(out.code).descriptor.template.ast.children[0].props;
  assert.ok(!attrs.some((prop) => prop.name === 'vb-color'));
  assert.ok(attrs.some((prop) => prop.name === 'title'));
});
