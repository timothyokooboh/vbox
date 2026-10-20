import test from 'node:test';
import assert from 'node:assert/strict';
import { transformVueSfc } from '../dist/transform.js';
const id = '/project/Example.vue';

test('repeated transforms do not reinterpret generated semantic spreads as inferred styles', () => {
  const source =
    '<template><button vb-color="red" type="button">Save</button></template>';
  const first = transformVueSfc(source, id);
  const second = transformVueSfc(first.code, id);
  assert.ok(second === null || second.code === first.code);
});

test('dependency SFCs, non-SFC files and Vue virtual requests remain untouched', () => {
  const source = '<template><Widget :size :member vb-color="red" /></template>';
  for (const excluded of [
    '/project/node_modules/theme/Team.vue',
    'C:\\project\\node_modules\\theme\\Team.vue',
    '/project/App.vue?vue&type=template',
    '/project/App.vue?vue&type=script&lang.ts',
    '/project/source.ts',
    '\0virtual:Example.vue',
  ])
    assert.equal(transformVueSfc(source, excluded), null, excluded);
});

test('no-op SFCs preserve authored template, script, style and custom-block bytes', () => {
  const source = `<script setup>const id = 'plain';</script>\n<template>\n  <p\n    :id\n    data-note='unchanged'\n  >Text</p>\n</template>\n<style scoped>p { color: red; }</style>\n<docs>{"note":"untouched"}</docs>`;
  const result = transformVueSfc(source, id);
  assert.ok(result === null || result.code === source);
});
