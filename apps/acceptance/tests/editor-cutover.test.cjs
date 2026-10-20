const test = require('node:test');
const assert = require('node:assert/strict');
const { createEditor, previewText } = require('./support/editor-service.cjs');

test('unknown explicit property names offer informational guidance without rejecting future CSS', (t) => {
  const source = '<template><p vb-colro="red" /></template>';
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  assert.match(
    previewText(editor.hover('vb-colro')),
    /Unrecognized.*colro.*styling/,
  );
  assert.deepEqual(editor.diagnostics(), []);
});

test('property advisories refresh after correction and do not replace token previews', (t) => {
  const editor = createEditor('<template><p vb-colro="cl-brand" /></template>');
  t.after(() => editor.dispose());
  assert.match(previewText(editor.hover('vb-colro')), /Unrecognized.*colro/);
  assert.match(previewText(editor.hover('cl-brand')), /VBox token preview/);
  editor.update('<template><p vb-color="cl-brand" /></template>');
  assert.doesNotMatch(previewText(editor.hover('vb-color')), /Unrecognized/);
  assert.match(previewText(editor.hover('cl-brand')), /VBox token preview/);
  assert.deepEqual(editor.diagnostics(), []);
});

test('bound property names receive the same advisory without rejecting their value', (t) => {
  const editor = createEditor(`<template><p :vb-colro="'red'" /></template>`);
  t.after(() => editor.dispose());
  assert.match(previewText(editor.hover('vb-colro')), /Unrecognized.*colro/);
  assert.deepEqual(editor.diagnostics(), []);
});

test('literal v-pre subtrees do not claim their attributes are styling', (t) => {
  const editor = createEditor(
    '<template><div v-pre><p vbox vb-colro="red" /></div></template>',
  );
  t.after(() => editor.dispose());
  assert.doesNotMatch(
    previewText(editor.hover('vb-colro')),
    /Unrecognized|styling/,
  );
  assert.doesNotMatch(previewText(editor.hover('vbox')), /retired/);
});

test('advisories honor replacement of default aliases in project configuration', (t) => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = fs.mkdtempSync(path.resolve(__dirname, '../.editor-advisory-'));
  fs.writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({ extends: '../tsconfig.json', include: ['src/**/*.vue'] }),
  );
  fs.writeFileSync(
    path.join(root, 'vbox.config.ts'),
    'export default { aliases: { strategy: "replace", values: { paint: "color" } } }',
  );
  const editor = createEditor(
    '<template><p vb-bg="red" vb-paint="blue" /></template>',
    root,
  );
  t.after(() => {
    editor.dispose();
    fs.rmSync(root, { recursive: true, force: true });
  });
  assert.match(previewText(editor.hover('vb-bg')), /Unrecognized.*bg/);
  assert.doesNotMatch(previewText(editor.hover('vb-paint')), /Unrecognized/);
  assert.deepEqual(editor.diagnostics(), []);
});
