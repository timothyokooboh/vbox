import test from 'node:test';
import assert from 'node:assert/strict';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { transformVueSfc } from '../dist/transform.js';

const position = (code, offset) => {
  const lines = code.slice(0, offset).split('\n');
  return { line: lines.length, column: lines.at(-1).length };
};

test('moved interaction expressions retain their authored source location', () => {
  const source = `<template>\n  <button\n    :vb-hover="{ focus: { color: missingValue } }"\n  />\n</template>`;
  const out = transformVueSfc(source, '/project/Interaction.vue');
  const actual = originalPositionFor(
    new TraceMap(out.map),
    position(out.code, out.code.indexOf('missingValue')),
  );
  assert.equal(actual.line, 3);
  assert.equal(actual.column, 33);
});

test('multiline, entity-encoded and single-quoted expressions map exact identifier columns', () => {
  const source = `<template>\r\n<p\r\n :vb-hover='{ content: "quoted",\r\n color: "\u03a3" &amp;&amp; entityValue }'\r\n/>\r\n</template>`;
  const out = transformVueSfc(source, '/project/Entities.vue');
  const expected = position(source, source.indexOf('entityValue'));
  const actual = originalPositionFor(
    new TraceMap(out.map),
    position(out.code, out.code.indexOf('entityValue')),
  );
  assert.equal(actual.line, expected.line);
  assert.equal(actual.column, expected.column);
  assert.ok(out.code.includes('&quot;quoted&quot;'));
  assert.ok(out.code.includes('&amp;&amp;'));
});

test('identical expressions on different elements retain their own original locations', () => {
  const source = `<template>\n<button :vb-hover="{ color: sameValue }"/>\n<button :vb-hover="{ color: sameValue }"/>\n</template>`;
  const out = transformVueSfc(source, '/project/Repeated.vue');
  const map = new TraceMap(out.map);
  let originalStart = 0;
  let generatedStart = 0;
  for (let index = 0; index < 2; index++) {
    const original = source.indexOf('sameValue', originalStart);
    const generated = out.code.indexOf('sameValue', generatedStart);
    const actual = originalPositionFor(map, position(out.code, generated));
    const expected = position(source, original);
    assert.equal(actual.line, expected.line);
    assert.equal(actual.column, expected.column);
    originalStart = original + 1;
    generatedStart = generated + 1;
  }
});

test('reordered grouped, individual and semantic spread expressions retain independent mappings', () => {
  const source = `<template>\n<button :vb="groupValue"\n :vb-hover="styleValue"\n v-bind="semanticValue"/>\n</template>`;
  const out = transformVueSfc(source, '/project/Groups.vue');
  const map = new TraceMap(out.map);
  for (const token of ['groupValue', 'styleValue', 'semanticValue']) {
    const actual = originalPositionFor(
      map,
      position(out.code, out.code.indexOf(token)),
    );
    const expected = position(source, source.indexOf(token));
    assert.equal(actual.line, expected.line);
    assert.equal(actual.column, expected.column);
  }
});

test('decoded static strings cannot impersonate internal expression placeholders', () => {
  const source =
    '<template><p vb-content="&#95;&#95;vboxStylesExpression0__" :vb-color="colorValue" /></template>';
  const out = transformVueSfc(source, '/project/StaticContent.vue');
  assert.ok(out.code.includes('&quot;__vboxStylesExpression0__&quot;'));
});

test('selector functions, pseudo-elements and encoded parent references retain expression locations', () => {
  const source = `<template>\n<p\n :vb-declarations="{ '&amp;:is(.active, .ready), [data-x=&quot;a,b&quot;]': { color: selectorValue } }"\n :vb-pseudos="{ '::before': { content: contentValue } }"/>\n</template>`;
  const out = transformVueSfc(source, '/project/Selectors.vue');
  const map = new TraceMap(out.map);
  for (const token of ['selectorValue', 'contentValue']) {
    const actual = originalPositionFor(
      map,
      position(out.code, out.code.indexOf(token)),
    );
    const expected = position(source, source.indexOf(token));
    assert.equal(actual.line, expected.line);
    assert.equal(actual.column, expected.column);
  }
});
