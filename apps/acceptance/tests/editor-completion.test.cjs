const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createEditor } = require('./support/editor-service.cjs');

function completions(editor, source, text) {
  editor.update(source);
  return editor.completeAt(source.lastIndexOf(text) + text.length);
}

test('native-heavy files offer exhaustive namespaced properties after the 200th element', (t) => {
  const editor = createEditor('<template><p/></template>');
  t.after(() => editor.dispose());
  const before = '<p vb-color="cl-brand"/>'.repeat(220);
  for (const [prefix, expected] of [
    ['vb-back', 'vb-backdrop-filter'],
    ['vb-text', 'vb-text-transform'],
    ['vb-foc', 'vb-focus-visible'],
  ]) {
    const source = `<template>${before}<p ${prefix}/></template>`;
    assert.ok(completions(editor, source, prefix).includes(expected), expected);
  }
});

test('nested grouped font-size completion uses its leaf property instead of unrelated token families', (t) => {
  const source = `<template><button :vb="{ hover: { fontSize: '' } }">Save</button></template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const values = editor.completeAt(source.indexOf("''") + 1);
  assert.ok(values.includes('fs-xl'));
  assert.ok(!values.some((value) => /^(cl|sp|br)-/.test(value)));
});

test('font sizes offer CSS keywords and explicit token variables alongside compatible tokens', (t) => {
  const source = '<template><p vb-fs="">Text</p></template>';
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const values = editor.completeAt(source.indexOf('""') + 1);
  for (const expected of ['fs-xl', 'var(--font-size-xl)', 'inherit', 'larger'])
    assert.ok(values.includes(expected), expected);
  assert.ok(!values.includes('cl-brand'));
});

test('HTML, SVG and custom component instances offer clean object groups and aliases while typing the namespace', (t) => {
  const editor = createEditor('<template><p/></template>');
  t.after(() => editor.dispose());
  for (const tag of ['button', 'path', 'AppButton']) {
    const source = `<template><${tag} vb /></template>`;
    const keys = completions(editor, source, ' vb');
    for (const key of [
      'vb-font-size',
      'vb-fs',
      'vb-brand-color',
      'vb-mq',
      'vb-cq',
      'vb-disabled',
      'vb-2xl',
      'vb-focus-visible',
    ])
      assert.ok(keys.includes(key), `${tag}: ${key}`);
    assert.ok(!keys.includes('font-size'));
    assert.equal(new Set(keys).size, keys.length);
  }
});

function editorProject(t, config, pluginOptions = {}) {
  const root = fs.mkdtempSync(
    path.resolve(__dirname, '../.editor-completions-'),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({
      extends: '../tsconfig.json',
      include: ['src/**/*.vue', 'vbox.d.ts', 'vbox.config.ts'],
      vueCompilerOptions: {
        plugins: [{ name: '@veebox/volar', ...pluginOptions }],
      },
    }),
  );
  fs.writeFileSync(path.join(root, 'vbox.config.ts'), config);
  return root;
}

test('config-only edits refresh value candidates without rebuilding the Vue document', (t) => {
  const config = (size) =>
    `import { defineConfig } from '@veebox/core'; export default defineConfig({ enableDefaultTheme: false, theme: { fontSize: { ${size}: '2rem' } } });`;
  const root = editorProject(t, config('original'));
  const source = '<template><p vb-font-size=""/></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  const position = source.indexOf('""') + 1;
  assert.ok(editor.completeAt(position).includes('fs-original'));
  fs.writeFileSync(path.join(root, 'vbox.config.ts'), config('changed'));
  editor.projectChanged();
  const values = editor.completeAt(position);
  assert.ok(values.includes('fs-changed'));
  assert.ok(!values.includes('fs-original'));
});

test('config-only alias edits refresh names and meaning in the existing editor session', (t) => {
  const config = (property) =>
    `import { defineConfig } from '@veebox/core'; export default defineConfig({ enableDefaultTheme: false, aliases: { values: { emphasis: '${property}', ${property === 'color' ? 'previous' : 'added'}: 'width' } }, theme: { color: { brand: '#123456' }, fontSize: { heading: '2rem' } } });`;
  const root = editorProject(t, config('color'));
  const source = '<template><p vb-emphasis="" vb /></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  const position = source.indexOf('""') + 1;
  assert.ok(editor.completeAt(position).includes('cl-brand'));
  fs.writeFileSync(path.join(root, 'vbox.config.ts'), config('fontSize'));
  editor.projectChanged();
  const values = editor.completeAt(position);
  assert.ok(values.includes('fs-heading'));
  assert.ok(!values.includes('cl-brand'));
  const keys = editor.completeAt(source.lastIndexOf(' vb') + 3);
  assert.ok(keys.includes('vb-added'));
  assert.ok(!keys.includes('vb-previous'));
});

test('compound values complete a partially typed token without changing the surrounding CSS', (t) => {
  const source = '<template><p vb-border="1px solid cl-"/></template>';
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const values = editor.completeAt(source.indexOf('cl-') + 3);
  assert.ok(values.includes('cl-brand'));
  assert.ok(!values.includes('fs-xl'));
});

test('token candidates remain exhaustive beyond 200 configured names', (t) => {
  const sizes = Object.fromEntries(
    Array.from({ length: 320 }, (_, index) => [`size${index}`, `${index}px`]),
  );
  const root = editorProject(
    t,
    `export default ${JSON.stringify({ enableDefaultTheme: false, theme: { fontSize: sizes } })};`,
  );
  const source = '<template><p vb-fs="fs-size3"/></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  assert.ok(
    editor.completeAt(source.indexOf('fs-size3') + 8).includes('fs-size319'),
  );
});

test('generated token and alias declaration interfaces contribute property-specific suggestions', (t) => {
  const root = editorProject(
    t,
    'export default { enableDefaultTheme: false };',
  );
  fs.writeFileSync(
    path.join(root, 'vbox.d.ts'),
    `import '@veebox/core'; declare module '@veebox/core' { interface FontSizeTokensInterface { declared: string } interface ColorTokensInterface { accent: string } interface AliasMap { heading: 'fontSize' } }`,
  );
  const source = '<template><p vb-heading="" vb /></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  const values = editor.completeAt(source.indexOf('""') + 1);
  assert.ok(values.includes('fs-declared'));
  assert.ok(values.includes('var(--font-size-declared)'));
  assert.ok(!values.includes('cl-accent'));
  assert.ok(
    editor.completeAt(source.lastIndexOf(' vb') + 3).includes('vb-heading'),
  );
});

for (const [attribute, expression] of [
  ['vb', "[{ dark: { md: { hover: { 'border-color': '' } } } }]"],
  ['vb-mq', "{ '@media (width > 40rem)': { color: '' } }"],
  ['vb-cq', "{ '@container card (width > 20rem)': { focus: { bg: '' } } }"],
  ['vb-declarations', "{ '& > p': { color: '' } }"],
  ['vb-pseudos', "{ '::before': { color: '' } }"],
]) {
  test(`bound ${attribute} values use the nested leaf's color vocabulary`, (t) => {
    const source = `<template><p :${attribute}="${expression}"/></template>`;
    const editor = createEditor(source);
    t.after(() => editor.dispose());
    const values = editor.completeAt(source.indexOf("''") + 1);
    assert.ok(values.includes('cl-brand'));
    assert.ok(!values.includes('fs-xl'));
    assert.deepEqual(editor.diagnostics(), []);
  });
}

test('future CSS properties and raw functions do not produce generated completion diagnostics', (t) => {
  const source =
    '<template><p vb-future-property="future(1px)" vb-font-size="clamp(1rem, 2vw, 2rem)"/></template>';
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
});

test('authored names cannot collide with completion implementation symbols', (t) => {
  const source = `<script setup lang="ts">type __vboxConfig = { message: string }; const value: __vboxConfig = { message: 'Hello' };</script><template><p vb-font-size="">{{ value.message }}</p></template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  assert.deepEqual(editor.diagnostics(), []);
  assert.ok(editor.completeAt(source.indexOf('""') + 1).includes('fs-xl'));
});

test('logical border colors resolve the color family and logical spacing resolves spacing', (t) => {
  const editor = createEditor('<template><p/></template>');
  t.after(() => editor.dispose());
  for (const [key, expected, excluded] of [
    ['border-inline-start-color', 'cl-brand', 'fs-xl'],
    ['padding-block-end', 'sp-large', 'cl-brand'],
  ]) {
    const source = `<template><p vb-${key}=""/></template>`;
    editor.update(source);
    const values = editor.completeAt(source.indexOf('""') + 1);
    assert.ok(values.includes(expected), key);
    assert.ok(!values.includes(excluded), key);
  }
});

test('explicit alias metadata replaces discovered custom keys without removing defaults', (t) => {
  const root = editorProject(
    t,
    `import { defineConfig } from '@veebox/core'; export default defineConfig({ aliases: { values: { heading: 'fontSize', omitted: 'color' } } });`,
    { aliases: ['heading', 'manualAlias'] },
  );
  const source = '<template><p vb /></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  const keys = editor.completeAt(source.indexOf(' vb') + 3);
  assert.ok(keys.includes('vb-heading'));
  assert.ok(keys.includes('vb-manual-alias'));
  assert.ok(keys.includes('vb-fs'));
  assert.ok(!keys.includes('vb-omitted'));
});

test('compound completion replacement spans cover the token, not the surrounding border declaration', (t) => {
  const source = '<template><p vb-border="1px solid cl-"/></template>';
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const info = editor.completionInfoAt(source.indexOf('cl-') + 3);
  const entry = info.entries.find((entry) => entry.name === 'cl-brand');
  const span = entry.replacementSpan ?? info.optionalReplacementSpan;
  assert.ok(span);
  assert.equal(source.slice(span.start, span.start + span.length), 'cl-');
});

test('property completion survives incomplete template edits and nested object key prefixes', (t) => {
  const editor = createEditor('<template><p/></template>');
  t.after(() => editor.dispose());
  const partial = '<template><p vb-back\n</template>';
  assert.ok(
    completions(editor, partial, 'vb-back').includes('vb-backdrop-filter'),
  );
  const object = `<template><p :vb="{ hover: { tex } }"/></template>`;
  const keys = completions(editor, object, 'tex');
  assert.ok(keys.includes('text-transform'));
  assert.ok(!keys.includes('vb-text-transform'));
});

test('native-heavy completion remains responsive across cold, warm and incremental requests', (t) => {
  const source = (suffix) =>
    `<template>${'<p vb-color="cl-brand"/>'.repeat(240)}<p vb-${suffix}/></template>`;
  const before = performance.now();
  const editor = createEditor(source('back'));
  t.after(() => editor.dispose());
  assert.ok(
    editor
      .completeAt(source('back').lastIndexOf('vb-back') + 7)
      .includes('vb-backdrop-filter'),
  );
  const cold = performance.now() - before;
  const warm = [];
  for (let index = 0; index < 20; index++) {
    const start = performance.now();
    assert.ok(
      editor
        .completeAt(source('back').lastIndexOf('vb-back') + 7)
        .includes('vb-backdrop-filter'),
    );
    warm.push(performance.now() - start);
  }
  const incremental = [];
  for (let index = 0; index < 5; index++) {
    const next = source(index % 2 ? 'back' : 'text');
    const start = performance.now();
    editor.update(next);
    const keys = editor.completeAt(next.lastIndexOf('vb-') + 7);
    assert.ok(keys.includes('vb-text-transform'));
    incremental.push(performance.now() - start);
  }
  warm.sort((a, b) => a - b);
  const metrics = {
    coldMs: cold,
    warmP95Ms: warm[18],
    incrementalMaxMs: Math.max(...incremental),
  };
  t.diagnostic(JSON.stringify(metrics));
  // Generous regression budgets, not promises about every user's machine.
  const multiplier = process.env.CI ? 2 : 1;
  assert.ok(cold < 8000 * multiplier, JSON.stringify(metrics));
  assert.ok(metrics.warmP95Ms < 200 * multiplier, JSON.stringify(metrics));
  assert.ok(
    metrics.incrementalMaxMs < 2000 * multiplier,
    JSON.stringify(metrics),
  );
});

test('plain config exports retain runtime alias meaning and disabled-default semantics', (t) => {
  const root = editorProject(
    t,
    `export default { enableDefaultTheme: false, aliases: { values: { heading: 'fontSize' } }, theme: { fontSize: { custom: '2rem' } } };`,
  );
  const source = '<template><p vb-heading=""/></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  const values = editor.completeAt(source.indexOf('""') + 1);
  assert.ok(values.includes('fs-custom'));
  assert.ok(!values.includes('fs-xl'));
});

test('grouped style function calls preserve PVA variant argument completions', (t) => {
  const source = `<script setup lang="ts">import { pva } from '@veebox/property-variance-authority'; const styles = pva({ variants: { tone: { quiet: { color: 'red' }, strong: { color: 'blue' } } } });</script><template><button :vb="styles({ tone: '' })"/></template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const values = editor.completeAt(source.indexOf("''") + 1);
  assert.ok(values.includes('quiet'));
  assert.ok(values.includes('strong'));
  assert.ok(!values.includes('cl-brand'));
});

test('kebab and numeric alias spellings share the core-normalized property meaning', (t) => {
  const root = editorProject(
    t,
    `import { defineConfig } from '@veebox/core'; export default defineConfig({ enableDefaultTheme: false, aliases: { values: { 'pad-2': 'padding', 'text-size': 'fontSize' } }, theme: { spacing: { roomy: '2rem' }, fontSize: { heading: '3rem' } } });`,
  );
  const editor = createEditor('<template><p/></template>', root);
  t.after(() => editor.dispose());
  for (const [name, token] of [
    ['vb-pad-2', 'sp-roomy'],
    ['vbPad2', 'sp-roomy'],
    ['vb-text-size', 'fs-heading'],
    ['vbTextSize', 'fs-heading'],
  ]) {
    const source = `<template><p ${name}=""/></template>`;
    editor.update(source);
    assert.ok(
      editor.completeAt(source.indexOf('""') + 1).includes(token),
      name,
    );
  }
});

test('plain alias replacement does not advertise defaults removed by runtime configuration', (t) => {
  const root = editorProject(
    t,
    `export default { aliases: { strategy: 'replace', values: { heading: 'fontSize' } } };`,
  );
  const source = '<template><p vb /></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  const keys = editor.completeAt(source.indexOf(' vb') + 3);
  assert.ok(keys.includes('vb-heading'));
  assert.ok(!keys.includes('vb-fs'));
  assert.ok(!keys.includes('vb-bg'));
});

test('style object keys never complete template-prefixed spellings', (t) => {
  const source = `<template><p :vb="{ vb: '' }"/></template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const keys = editor.completeAt(source.lastIndexOf('vb:') + 2);
  assert.ok(keys.includes('font-size'));
  assert.ok(!keys.some((key) => key.startsWith('vb-')));
});

test('style value indexing preserves the indexed object key completions', (t) => {
  const source = `<script setup lang="ts">const palette = { brand: 'red', muted: 'blue' };</script><template><p :vb-color="palette['']"/></template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const values = editor.completeAt(source.indexOf("''") + 1);
  assert.ok(values.includes('brand'));
  assert.ok(values.includes('muted'));
  assert.ok(!values.includes('cl-brand'));
});

for (const [binding, empty] of [
  ['vb-font-size=""', '""'],
  ['stable', "''"],
  [':vb-font-size=\'""\'', '""'],
  [':vb-font-size="``"', '``'],
  ['nested', "''"],
]) {
  const attribute =
    binding === 'stable'
      ? `:vb-font-size="''"`
      : binding === 'nested'
        ? `:vb="{ fontSize: '' }"`
        : binding;
  test(`accepting an empty value completion preserves delimiters: ${attribute}`, (t) => {
    const source = `<template><p ${attribute}/></template>`;
    const editor = createEditor(source);
    t.after(() => editor.dispose());
    const cursor = source.indexOf(empty) + 1;
    const info = editor.completionInfoAt(cursor);
    const entry = info?.entries.find((entry) => entry.name === 'fs-xl');
    assert.ok(entry);
    const span = entry.replacementSpan ?? info.optionalReplacementSpan;
    assert.ok(span);
    const result =
      source.slice(0, span.start) +
      (entry.insertText ?? entry.name) +
      source.slice(span.start + span.length);
    assert.equal(
      result,
      source.slice(0, cursor) + 'fs-xl' + source.slice(cursor),
    );
  });
}

for (const [tag, attribute, object] of [
  ['button', 'vb-hover', '{  }'],
  ['AppButton', 'vb', '{  }'],
  ['p', 'vb', "{ color: 'red',  }"],
  ['p', 'vb', "{ mq: { '@media (width > 40rem)': {  } } }"],
]) {
  test(`style keys complete at an insertion point on ${tag} :${attribute}: ${object}`, (t) => {
    const source = `<template><${tag} :${attribute}="${object}"/></template>`;
    const editor = createEditor(source);
    t.after(() => editor.dispose());
    const keys = editor.completeAt(source.indexOf('  ') + 1);
    for (const key of [
      'backdrop-filter',
      'fontSize',
      'brand-color',
      'mq',
      'hover',
    ])
      assert.ok(keys.includes(key), key);
    assert.ok(!keys.includes('vb-color'));
  });
}

test('broadly annotated configs retain current runtime token and alias metadata', (t) => {
  const root = editorProject(
    t,
    `import type { VBoxPluginOptions } from '@veebox/core'; const config: VBoxPluginOptions = { enableDefaultTheme: false, aliases: { values: { heading: 'fontSize' } }, theme: { fontSize: { custom: '2rem' } } }; export default config;`,
  );
  const source = '<template><p vb-heading="" vb /></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  const values = editor.completeAt(source.indexOf('""') + 1);
  assert.ok(values.includes('fs-custom'));
  assert.ok(!values.includes('fs-xl'));
  assert.ok(
    editor.completeAt(source.lastIndexOf(' vb') + 3).includes('vb-heading'),
  );
});
