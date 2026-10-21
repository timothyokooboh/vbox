const test = require('node:test');
const assert = require('node:assert/strict');
const createPlugin = require('@veebox/volar');

test('the public CommonJS plugin supports the Vue language host lifecycle', () => {
  assert.equal(createPlugin.default, createPlugin);
  const plugin = createPlugin({ compilerOptions: {} });
  assert.equal(typeof plugin.resolveEmbeddedCode, 'function');
  assert.deepEqual(plugin.getEmbeddedCodes(), []);
});

test('retired inference options fail with actionable explicit-namespace guidance', () => {
  for (const key of [
    'parseAllComponents',
    'forceStyleAttrs',
    'forceSemanticAttrs',
  ]) {
    for (const value of [true, false, []]) {
      assert.throws(
        () => createPlugin({ config: { [key]: value } }),
        /removed.*vb-\*.*:vb/,
      );
    }
  }
});

test('non-script embedded documents and files without templates remain untouched', () => {
  const plugin = createPlugin({ compilerOptions: {} });
  const unrelated = { id: 'template', content: ['authored document'] };
  plugin.resolveEmbeddedCode('App.vue', { template: { ast: {} } }, unrelated);
  assert.deepEqual(unrelated.content, ['authored document']);
  const scriptOnly = {
    id: 'script_ts',
    content: ['export const answer = 42;'],
  };
  plugin.resolveEmbeddedCode('App.vue', {}, scriptOnly);
  assert.deepEqual(scriptOnly.content, ['export const answer = 42;']);
});
