const assert = require('node:assert/strict');
const { createEditor, previewText } = require('./editor-service.cjs');
const source = '<template><p vb-color="cl-brand" /></template>';
const editor = createEditor(source, process.cwd());
try {
  const preview = previewText(editor.hover('cl-brand'));
  assert.match(preview, /VBox token preview/);
  assert.match(preview, /#123456/);
  assert.deepEqual(editor.diagnostics(), []);
  assert.ok(editor.completeAt(source.indexOf('cl-brand')).includes('cl-brand'));
} finally {
  editor.dispose();
}
