const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const ts = require('typescript');
const {
  createLanguage,
  createVueLanguagePlugin,
  createParsedCommandLine,
} = require('@vue/language-core');
const {
  decorateLanguageServiceHost,
  createProxyLanguageService,
} = require('@volar/typescript');

// Exercise the same TypeScript service adapter used by Vue's editor plugin.
function createEditor(source, root = path.resolve(__dirname, '..')) {
  const file = path.join(root, 'src/EditorConsumer.vue');
  const config = createParsedCommandLine(
    ts,
    ts.sys,
    path.join(root, 'tsconfig.json'),
  );
  config.options.allowNonTsExtensions = true;
  let version = 0;
  const snapshot = (id) => {
    const text = id === file ? source : ts.sys.readFile(id);
    return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
  };
  const host = {
    ...ts.sys,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    fileExists: (id) => id === file || ts.sys.fileExists(id),
    getCompilationSettings: () => config.options,
    getScriptFileNames: () => [file],
    getScriptVersion: () => String(version),
    getScriptSnapshot: snapshot,
    getScriptKind: (id) =>
      id.endsWith('.vue') ? ts.ScriptKind.Deferred : ts.ScriptKind.TS,
    getCurrentDirectory: () => root,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  };
  const language = createLanguage(
    [
      createVueLanguagePlugin(
        ts,
        config.options,
        config.vueOptions,
        (id) => id,
      ),
      {
        getLanguageId: (id) =>
          /\.[cm]?tsx?$/.test(id) ? 'typescript' : 'javascript',
      },
    ],
    new Map(),
    (id) => {
      const value = snapshot(id);
      if (value) language.scripts.set(id, value);
      else language.scripts.delete(id);
    },
  );
  decorateLanguageServiceHost(ts, language, host);
  const service = ts.createLanguageService(host);
  const { proxy, initialize } = createProxyLanguageService(service);
  initialize(language);
  return {
    completeAt: (offset) =>
      proxy
        .getCompletionsAtPosition(file, offset, {})
        ?.entries.map((entry) => entry.name.replace(/^["']|["']$/g, '')) ?? [],
    hover: (token) =>
      proxy.getQuickInfoAtPosition(file, source.indexOf(token) + 1),
    diagnostics: () =>
      proxy
        .getSemanticDiagnostics(file)
        .map(({ code, start, length, messageText }) => ({
          code,
          start,
          length,
          messageText: ts.flattenDiagnosticMessageText(messageText, '\n'),
        })),
    update: (next) => {
      source = next;
      version++;
    },
    dispose: () => service.dispose(),
  };
}

test('public editor service exposes the published token preview and refreshes edits', (t) => {
  const template = (token) =>
    `<script setup lang="ts">import { VBox } from '@veebox/vue';</script><template><VBox fs="${token}">Hello</VBox></template>`;
  const start = performance.now();
  const editor = createEditor(template('fs-xl'));
  t.after(() => editor.dispose());
  const first = editor.hover('fs-xl');
  assert.match(
    ts.displayPartsToString(first?.documentation),
    /fs-xl.*1\.25rem/,
  );
  const cold = performance.now() - start;
  editor.update(template('fs-lg'));
  const edited = editor.hover('fs-lg');
  assert.match(
    ts.displayPartsToString(edited?.documentation),
    /fs-lg.*1\.125rem/,
  );
  const samples = [];
  for (let i = 0; i < 20; i++) {
    const before = performance.now();
    assert.ok(editor.hover('fs-lg'));
    samples.push(performance.now() - before);
  }
  samples.sort((a, b) => a - b);
  t.diagnostic(
    JSON.stringify({
      coldHoverMs: Math.round(cold),
      warmHoverP95Ms: samples[18],
    }),
  );
});

test('namespaced scalar styles do not widen semantic translate typing', (t) => {
  const source = (value) =>
    `<script setup lang="ts">import '@veebox/vue';</script><template><button translate="${value}" vb-translate="20px" vb-color="red">Save</button></template>`;
  const editor = createEditor(source('no'));
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
  editor.update(source('20px'));
  assert.ok(
    editor
      .diagnostics()
      .some((diagnostic) =>
        /20px/.test(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        ),
      ),
  );
});

test('namespaced token values retain their source-mapped hover preview', (t) => {
  const editor = createEditor(
    '<template><p vb-color="cl-brand">Token</p></template>',
  );
  t.after(() => editor.dispose());
  assert.match(
    ts.displayPartsToString(editor.hover('cl-brand')?.documentation),
    /cl-brand.*#123456/,
  );
});

test('editor vocabulary is config-specific and refreshes on the next document edit', (t) => {
  const root = fs.mkdtempSync(path.resolve(__dirname, '../.editor-config-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({
      extends: '../tsconfig.json',
      include: ['src/**/*.vue'],
      vueCompilerOptions: { plugins: ['@veebox/volar'] },
    }),
  );
  const config = path.join(root, 'vbox.config.ts');
  fs.writeFileSync(
    config,
    'export default { enableDefaultTheme: false, theme: { color: { brand: "#654321" } } }',
  );
  const source = '<template><p vb-color="cl-brand">Hello</p></template>';
  const local = createEditor(source, root);
  const defaultEditor = createEditor(source);
  t.after(() => {
    local.dispose();
    defaultEditor.dispose();
  });
  assert.match(
    ts.displayPartsToString(local.hover('cl-brand')?.documentation),
    /#654321/,
  );
  assert.match(
    ts.displayPartsToString(defaultEditor.hover('cl-brand')?.documentation),
    /#123456/,
  );
  fs.writeFileSync(
    config,
    'export default { enableDefaultTheme: false, theme: { color: { brand: "#abcdef" } } }',
  );
  local.update(source.replace('Hello', 'Hello again'));
  assert.match(
    ts.displayPartsToString(local.hover('cl-brand')?.documentation),
    /#abcdef/,
  );
  const palette = path.join(root, 'palette.js');
  fs.writeFileSync(palette, 'export default "#112233"');
  fs.writeFileSync(
    config,
    'import brand from "./palette.js"; export default { enableDefaultTheme: false, theme: { color: { brand } } }',
  );
  local.update(source.replace('Hello', 'Imported color'));
  assert.match(
    ts.displayPartsToString(local.hover('cl-brand')?.documentation),
    /#112233/,
  );
  fs.writeFileSync(palette, 'export default "#445566"');
  local.update(source.replace('Hello', 'Imported color updated'));
  assert.match(
    ts.displayPartsToString(local.hover('cl-brand')?.documentation),
    /#445566/,
  );
});

test('explicit style completions use prefixed aliases and property-specific token values', (t) => {
  const source = '<template><p vb-font-size="">Hello</p></template>';
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const values = editor.completeAt(source.indexOf('""') + 1);
  assert.ok(values.includes('fs-xl'));
  assert.ok(
    !values.some((name) => name.startsWith('cl-') || name.startsWith('sp-')),
  );
  const attributes = '<template><p vb-bran>Hello</p></template>';
  editor.update(attributes);
  const keys = editor.completeAt(
    attributes.indexOf('vb-bran') + 'vb-bran'.length,
  );
  assert.ok(keys.includes('vb-brand-color'));
  assert.ok(!keys.includes('brand-color'));
});

test('grouped styles are typed separately from native semantic translate and ordinary spreads', (t) => {
  const template = (binding) =>
    `<script setup lang="ts">import '@veebox/vue'; import type { VBoxStyleProps } from '@veebox/core'; const styles: VBoxStyleProps = { translate: '8px', color: 'red' };</script><template><button translate="no" ${binding}>Save</button></template>`;
  const editor = createEditor(template(':vb="styles"'));
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
  editor.update(template('v-bind="styles"').replace(' translate="no"', ''));
  assert.ok(
    editor
      .diagnostics()
      .some((item) =>
        /translate/.test(
          ts.flattenDiagnosticMessageText(item.messageText, '\n'),
        ),
      ),
  );
  editor.update(template(':vb="123"'));
  assert.ok(
    editor
      .diagnostics()
      .some((item) =>
        /number|123/.test(
          ts.flattenDiagnosticMessageText(item.messageText, '\n'),
        ),
      ),
  );
});

test('style-only types permit withdrawal inside existing condition and selector groups', (t) => {
  const editor = createEditor(`<script setup lang="ts">
import '@veebox/vue'; import type { VBoxStyles } from '@veebox/core';
const styles: VBoxStyles = { hover: { color: null }, _disabled: { opacity: null }, declarations: { '&::before': { content: null } } };
</script><template><button :vb="styles">Save</button></template>`);
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
});

test('readonly ordered style sources accept conditional omissions without widening native attrs', (t) => {
  const editor = createEditor(`<script setup lang="ts">
import '@veebox/vue'; import type { VBoxStyleProps, VBoxStyleInput } from '@veebox/core';
const base: VBoxStyleProps = { translate: '8px' };
const styles: VBoxStyleInput = [base, false, null, undefined, { hover: { color: null } }] as const;
</script><template><button translate="no" :vb="styles">Save</button></template>`);
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
});

test('recursive style-only groups typecheck without changing semantic disabled', (t) => {
  const script = `<script setup lang="ts">import '@veebox/vue'; import type { VBoxStyles } from '@veebox/core';
const styles: VBoxStyles = { hover: { focus: { active: { color: 'red' } } }, disabled: { hover: { opacity: null } } };
</script>`;
  const editor = createEditor(
    `${script}<template><button disabled :vb="styles">Nested states</button></template>`,
  );
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
  editor.update(
    `${script}<template><button :disabled="{ color: 'red' }" :vb="styles">Wrong semantic value</button></template>`,
  );
  assert.ok(editor.diagnostics().length > 0);
});

test('recursive group typing preserves selector names that also name CSS properties', (t) => {
  const editor =
    createEditor(`<script setup lang="ts">import '@veebox/vue'; import type { VBoxStyles } from '@veebox/core';
const styles: VBoxStyles = { declarations: { filter: { color: 'red' } }, hover: { filter: { color: 'blue' } } };
</script><template><svg :vb="styles"><filter id="example" /></svg></template>`);
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
});

test('recursive theme/breakpoint types accept clean and compatibility 2xl groups', (t) => {
  const editor =
    createEditor(`<script setup lang="ts">import '@veebox/vue'; import type { VBoxStyles } from '@veebox/core';
const styles: VBoxStyles = { dark: { md: { hover: { color: 'red' } } }, '2xl': { color: 'green' }, _2xl: { opacity: null } };
</script><template><button :vb="styles">Combined contexts</button></template>`);
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
});

test('recursive query objects accept aliases, tokens and compatibility keys without widening semantic translate', (t) => {
  const script = `<script setup lang="ts">
import '@veebox/vue'; import type { VBoxStyles, VBoxStyleInput } from '@veebox/core';
const styles: VBoxStyles = { mq: { '@media (min-width: 40rem)': { cq: { '@container card (width > 10rem)': { dark: { _2xl: { _disabled: { bg: 'cl-brand', px: 'sp-large', translate: '8px' } } } } } } } };
const sources: VBoxStyleInput = [styles, false, null, { mq: { '@media (min-width: 40rem)': undefined }, cq: { '@container card (width > 10rem)': null } }] as const;
</script>`;
  const editor = createEditor(
    `${script}<template><button translate="no" :vb="sources">Queries</button></template>`,
  );
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
  editor.update(
    `<template><button :vb-cq="{ '@container card (min-width: 400px)': { dark: { hover: { color: 'cl-brand' } } } }">Query token</button></template>`,
  );
  assert.match(
    ts.displayPartsToString(editor.hover('cl-brand')?.documentation),
    /#123456/,
  );
  editor.update(
    `${script}<template><button translate="8px" :vb="sources">Invalid semantic translate</button></template>`,
  );
  assert.ok(editor.diagnostics().length > 0);
});

test('advanced selector lists and pseudo-elements typecheck and retain token previews', (t) => {
  const source = `<script setup lang="ts">import '@veebox/vue'; import type { VBoxStyles } from '@veebox/core';
const styles: VBoxStyles = { pseudos: { ':hover, :focus': { color: 'red' }, '::before': { content: 'attr(data-label)' } }, declarations: { '&:is(.active, .ready), .child': { color: 'blue' } } };
</script><template><button :vb="styles" :vb-pseudos="{ '::after': { color: 'cl-brand' } }">Selectors</button></template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
  assert.match(
    ts.displayPartsToString(editor.hover('cl-brand')?.documentation),
    /#123456/,
  );
});

test('quoted CSS content values cannot corrupt editor-generated TypeScript', (t) => {
  const editor = createEditor(
    `<template><span vb---label="'Custom'" :vb-pseudos="{ '::before': { content: 'var(--label)' } }">Content</span></template>`,
  );
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
});
