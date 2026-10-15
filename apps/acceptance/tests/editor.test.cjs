const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
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
function createEditor(source) {
  const root = path.resolve(__dirname, '..');
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
    hover: (token) =>
      proxy.getQuickInfoAtPosition(file, source.indexOf(token) + 1),
    complete: (text) =>
      proxy.getCompletionsAtPosition(
        file,
        source.indexOf(text) + text.length,
        {},
      ),
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
