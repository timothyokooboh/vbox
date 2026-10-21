const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createEditor, previewText } = require('./support/editor-service.cjs');

test('independent editor projects keep alias/value vocabularies isolated across config updates and recreation', (t) => {
  const root = fs.mkdtempSync(path.resolve(__dirname, '../.editor-isolation-'));
  const editors = [];
  t.after(() => {
    for (const editor of editors) editor.dispose();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const configure = (name, color, property) => {
    const directory = path.join(root, name);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(
      path.join(directory, 'tsconfig.json'),
      JSON.stringify({
        extends: '../../tsconfig.json',
        include: ['src/**/*.vue'],
      }),
    );
    fs.writeFileSync(
      path.join(directory, 'vbox.config.ts'),
      `import { defineConfig } from '@veebox/core'; export default defineConfig({ enableDefaultTheme: false, theme: { color: { brand: '${color}' }, fontSize: { brand: '17px' } }, aliases: { values: { paint: '${property}' } } });`,
    );
    return directory;
  };
  const source = '<template><p vb-paint="" vb-color="cl-brand" /></template>';
  const leftRoot = configure('left', '#110000', 'color');
  const rightRoot = configure('right', '#220000', 'fontSize');
  const left = createEditor(source, leftRoot);
  const right = createEditor(source, rightRoot);
  editors.push(left, right);
  const values = (editor) => editor.completeAt(source.indexOf('""') + 1);
  assert.ok(values(left).includes('cl-brand'));
  assert.ok(!values(left).includes('fs-brand'));
  assert.ok(values(right).includes('fs-brand'));
  assert.ok(!values(right).includes('cl-brand'));
  assert.match(previewText(left.hover('cl-brand')), /#110000/);
  assert.match(previewText(right.hover('cl-brand')), /#220000/);
  configure('left', '#330000', 'fontSize');
  left.projectChanged();
  assert.match(previewText(left.hover('cl-brand')), /#330000/);
  assert.ok(values(left).includes('fs-brand'));
  assert.match(previewText(right.hover('cl-brand')), /#220000/);
  const restarted = createEditor(source, rightRoot);
  editors.push(restarted);
  assert.match(previewText(restarted.hover('cl-brand')), /#220000/);
  for (const editor of editors) assert.deepEqual(editor.diagnostics(), []);
});

test('explicit completions distinguish custom component names from excluded native targets', (t) => {
  const editors = [];
  t.after(() => {
    for (const editor of editors) editor.dispose();
  });
  for (const tag of ['Meta', 'Link', 'Title']) {
    const source = `<script setup>import { defineComponent } from 'vue'; const ${tag} = defineComponent({ render: () => null });</script><template><${tag} vb-color="" /></template>`;
    const editor = createEditor(source);
    editors.push(editor);
    assert.ok(
      editor.completeAt(source.indexOf('""') + 1).includes('cl-brand'),
      `${tag} is a custom component, not a native head tag`,
    );
  }
  const source = '<template><meta vb-color="" /></template>';
  const native = createEditor(source);
  editors.push(native);
  assert.ok(!native.completeAt(source.indexOf('""') + 1).includes('cl-brand'));
});
