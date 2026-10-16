const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const {
  createEditor,
  previewText: preview,
} = require('./support/editor-service.cjs');

test('token previews are informational on semantic HTML and custom-component bindings', (t) => {
  const editor = createEditor('<template><p/></template>');
  t.after(() => editor.dispose());
  for (const tag of ['p', 'button', 'AppButton', 'svg']) {
    for (const attribute of ['title', 'data-theme', 'vb-color']) {
      const source = `<template><${tag} ${attribute}="cl-brand" /></template>`;
      editor.update(source);
      const info = editor.hover('cl-brand');
      assert.match(preview(info), /cl-brand.*#123456/, `${tag} ${attribute}`);
      assert.deepEqual(info.textSpan, {
        start: source.indexOf('cl-brand'),
        length: 8,
      });
    }
  }
});

test('preview content names the token rather than a generated variable', (t) => {
  const source = '<template><p vb-color="cl-brand" /></template>';
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const info = editor.hover('cl-brand');
  assert.match(preview(info), /cl-brand.*#123456.*dark.*#abcdef/);
  assert.doesNotMatch(
    ts.displayPartsToString(info?.displayParts),
    /const v\w*|__vbox/,
  );
  assert.deepEqual(editor.diagnostics(), []);
});

test('bound previews inspect string values, not comments, object keys or identifier expressions', (t) => {
  const source = `<script setup lang="ts">const cl = 4, brand = 2;</script><template><p :vb="{ 'cl-brand': 'red', color: cl-brand, /* cl-brand */ hover: { color: 'cl-brand' } }" /></template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  const offsets = [...source.matchAll(/cl-brand/g)].map((match) => match.index);
  for (const offset of offsets.slice(0, -1)) {
    assert.doesNotMatch(
      preview(editor.hoverAt(offset + 1)),
      /VBox token preview/,
    );
  }
  assert.match(
    preview(editor.hoverAt(offsets.at(-1) + 1)),
    /cl-brand.*#123456/,
  );
});

test('preceding HTML entities do not shift static or bound token preview spans', (t) => {
  const editor = createEditor('<template><p/></template>');
  t.after(() => editor.dispose());
  for (const binding of [
    'title="&quot; &amp; cl-brand"',
    `:title="'&quot; &amp; cl-brand'"`,
    `:vb="{ content: '&quot;', hover: { color: 'cl-brand' } }"`,
  ]) {
    const source = `<template><p ${binding} /></template>`;
    editor.update(source);
    const info = editor.hover('cl-brand');
    assert.match(preview(info), /cl-brand.*#123456/, binding);
    assert.deepEqual(
      info.textSpan,
      { start: source.indexOf('cl-brand'), length: 8 },
      binding,
    );
  }
});

test('config-only value edits refresh token previews without a Vue document edit', (t) => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = fs.mkdtempSync(path.resolve(__dirname, '../.editor-hover-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({
      extends: '../tsconfig.json',
      include: ['src/**/*.vue', 'vbox.config.ts'],
    }),
  );
  const config = (value) =>
    `import { defineConfig } from '@veebox/core'; export default defineConfig({ enableDefaultTheme: false, theme: { color: { brand: '${value}' } } });`;
  fs.writeFileSync(path.join(root, 'vbox.config.ts'), config('#112233'));
  const editor = createEditor(
    '<template><p title="cl-brand"/></template>',
    root,
  );
  t.after(() => editor.dispose());
  const text = () => {
    const info = editor.hover('cl-brand');
    return preview(info) + ts.displayPartsToString(info?.displayParts);
  };
  assert.match(text(), /#112233/);
  fs.writeFileSync(path.join(root, 'vbox.config.ts'), config('#445566'));
  editor.projectChanged();
  assert.match(text(), /#445566/);
  assert.doesNotMatch(text(), /#112233/);
});

function hoverProject(t, config) {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = fs.mkdtempSync(path.resolve(__dirname, '../.editor-hover-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({
      extends: '../tsconfig.json',
      include: ['src/**/*.vue', 'vbox.config.ts'],
    }),
  );
  const write = (value) =>
    fs.writeFileSync(
      path.join(root, 'vbox.config.ts'),
      `import { defineConfig } from '@veebox/core'; export default defineConfig(${value});`,
    );
  write(config);
  return { root, write };
}

test('live previews distinguish dark colors, color variables and resolved spacing references', (t) => {
  const config = (dark, spacing) =>
    `{ enableDefaultTheme: false, theme: { color: { brand: { default: '#123456', dark: '${dark}' }, reference: '$color.brand' }, spacing: { base: '${spacing}', roomy: '$spacing.base' } } }`;
  const { root, write } = hoverProject(t, config('#abcdef', '12px'));
  const editor = createEditor(
    '<template><p vb-color="cl-brand" vb-border="1px solid cl-reference" vb-padding="sp-roomy" /></template>',
    root,
  );
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('cl-brand')), /#123456.*dark.*#abcdef/);
  assert.match(preview(editor.hover('cl-reference')), /var\(--color-brand\)/);
  assert.match(preview(editor.hover('sp-roomy')), /12px/);
  write(config('#fedcba', '24px'));
  editor.projectChanged();
  assert.match(preview(editor.hover('cl-brand')), /#123456.*dark.*#fedcba/);
  assert.match(preview(editor.hover('sp-roomy')), /24px/);
});

test('config-only token additions and removals update previews in an unchanged template', (t) => {
  const { root, write } = hoverProject(
    t,
    `{ enableDefaultTheme: false, theme: { color: { old: '#112233' } } }`,
  );
  const source = '<template><p title="cl-old cl-added"/></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('cl-old')), /#112233/);
  assert.doesNotMatch(preview(editor.hover('cl-added')), /VBox token preview/);
  write(
    `{ enableDefaultTheme: false, theme: { color: { added: '#445566' } } }`,
  );
  editor.projectChanged();
  assert.match(preview(editor.hover('cl-added')), /#445566/);
  assert.doesNotMatch(preview(editor.hover('cl-old')), /VBox token preview/);
});

test('all branch, loop, slot and nested-style occurrences retain precise independent previews', (t) => {
  const source = `<script setup lang="ts">const visible = true; const rows = [{ id: 1 }]; const key = 'title';</script>
<template>
<section v-if="visible" title="cl-brand"><p v-for="row in rows" :key="row.id" vb-border="1px solid cl-brand" /></section>
<p v-else title="cl-brand"/>
<AppButton vbox-ignore color="cl-brand"><template #default="slot"><p :title="slot.ready ? 'cl-brand' : 'fs-lg'" /></template></AppButton>
<template v-for="row in rows" :key="row.id"><p :vb="{ dark: { md: { hover: { border: '1px solid cl-brand' } } }, mq: { '(width > 20rem)': { color: 'cl-brand' } }, cq: { '(width > 10rem)': { color: 'cl-brand' } }, pseudos: { ':focus': { color: 'cl-brand' } }, declarations: { '&::before': { color: 'cl-brand' } } }" /></template>
<p v-bind="{ title: 'cl-brand' }" :[key]="'cl-brand'" />
</template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  for (const match of source.matchAll(/cl-brand|fs-lg/g)) {
    const info = editor.hoverAt(match.index + 1);
    assert.match(
      preview(info),
      match[0] === 'fs-lg' ? /1\.125rem/ : /#123456/,
      String(match.index),
    );
    assert.deepEqual(info.textSpan, {
      start: match.index,
      length: match[0].length,
    });
  }
});

test('source edits and recoverable incomplete values never reuse old hover offsets', (t) => {
  const editor = createEditor('<template><p/></template>');
  t.after(() => editor.dispose());
  for (const source of [
    '<template><p title="cl-brand" /></template>',
    '<template>\n<!-- inserted text -->\n<p title="fs-lg" /></template>',
    `<template><p :vb="{ hover: { color: 'cl-brand' }" /></template>`,
    `<template><p :vb-color="'cl-brand" /></template>`,
  ]) {
    editor.update(source);
    const token = source.includes('fs-lg') ? 'fs-lg' : 'cl-brand';
    const info = editor.hover(token);
    assert.match(
      preview(info),
      token === 'fs-lg' ? /1\.125rem/ : /#123456/,
      source,
    );
    assert.deepEqual(info.textSpan, {
      start: source.indexOf(token),
      length: token.length,
    });
  }
  editor.update('<template><p title="ordinary value" /></template>');
  assert.doesNotMatch(preview(editor.hover('ordinary')), /VBox token preview/);
});

test('unrelated scripts, text, comments, attribute names and event handlers are not token preview regions', (t) => {
  const source = `<script setup lang="ts">const text = 'cl-brand'; function run(value: string) { return value; }</script><template><!-- cl-brand --><p cl-brand="ordinary" @click="run('cl-brand')">cl-brand {{ text }}</p></template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  for (const match of source.matchAll(/cl-brand/g)) {
    assert.doesNotMatch(
      preview(editor.hoverAt(match.index + 1)),
      /VBox token preview/,
    );
  }
});

test('preview and completion scaffolding does not surface unused-symbol suggestions', (t) => {
  const editor = createEditor(
    '<template><p vb-color="cl-brand" :vb="{ hover: { fontSize: \'fs-lg\' } }" /></template>',
  );
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('cl-brand')), /#123456/);
  assert.deepEqual(editor.suggestions(), []);
  assert.deepEqual(editor.diagnostics(), []);
});

test('theme default enablement tracks literal config edits instead of retaining disabled defaults', (t) => {
  const { root, write } = hoverProject(t, `{ enableDefaultTheme: false }`);
  const editor = createEditor('<template><p title="fs-xl"/></template>', root);
  t.after(() => editor.dispose());
  assert.doesNotMatch(preview(editor.hover('fs-xl')), /VBox token preview/);
  write('{}');
  editor.projectChanged();
  assert.match(preview(editor.hover('fs-xl')), /1\.25rem/);
  write('{ enableDefaultTheme: false }');
  editor.projectChanged();
  assert.doesNotMatch(preview(editor.hover('fs-xl')), /VBox token preview/);
});

test('template literal segments and entity-encoded token delimiters retain their authored spans', (t) => {
  const editor = createEditor('<template><p/></template>');
  t.after(() => editor.dispose());
  for (const [binding, token] of [
    [':title="`1px solid cl-brand ${1} fs-lg`"', 'cl-brand'],
    [':title="`1px solid cl-brand ${1} fs-lg`"', 'fs-lg'],
    ['title="cl&#45;brand"', 'cl&#45;brand'],
    [':title="&quot;cl-brand&quot;"', 'cl-brand'],
  ]) {
    const source = `<template><p ${binding} /></template>`;
    editor.update(source);
    const info = editor.hover(token);
    assert.match(
      preview(info),
      token === 'fs-lg' ? /1\.125rem/ : /#123456/,
      source,
    );
    assert.deepEqual(info.textSpan, {
      start: source.indexOf(token),
      length: token.length,
    });
  }
});

test('native-heavy hover requests stay responsive through incremental edits', (t) => {
  const source = (token) =>
    `<template>${'<p title="cl-brand"/>'.repeat(220)}<p vb-border="1px solid ${token}" /></template>`;
  const start = performance.now();
  const editor = createEditor(source('fs-lg'));
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('fs-lg')), /1\.125rem/);
  const cold = performance.now() - start;
  const warm = [];
  for (let index = 0; index < 20; index++) {
    const before = performance.now();
    assert.match(preview(editor.hover('fs-lg')), /1\.125rem/);
    warm.push(performance.now() - before);
  }
  warm.sort((a, b) => a - b);
  const incremental = performance.now();
  editor.update(source('fs-xl'));
  assert.match(preview(editor.hover('fs-xl')), /1\.25rem/);
  const metrics = {
    coldMs: cold,
    warmP95Ms: warm[18],
    incrementalMs: performance.now() - incremental,
  };
  t.diagnostic(JSON.stringify(metrics));
  const multiplier = process.env.CI ? 2 : 1;
  assert.ok(metrics.coldMs < 8000 * multiplier, JSON.stringify(metrics));
  assert.ok(metrics.warmP95Ms < 200 * multiplier, JSON.stringify(metrics));
  assert.ok(metrics.incrementalMs < 2000 * multiplier, JSON.stringify(metrics));
});

test('untyped config imports use an explicitly labelled snapshot refreshed by template edits', (t) => {
  const fs = require('node:fs'),
    path = require('node:path');
  const { root } = hoverProject(t, '{}');
  fs.writeFileSync(path.join(root, 'palette.js'), 'export default "#102030";');
  fs.writeFileSync(
    path.join(root, 'vbox.config.ts'),
    `import brand from './palette.js'; export default { enableDefaultTheme: false, theme: { color: { brand } } };`,
  );
  const source = '<template><p title="cl-brand"/></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('cl-brand')), /#102030/);
  assert.match(
    preview(editor.hover('cl-brand')),
    /configured snapshot.*template edits/,
  );
  fs.writeFileSync(path.join(root, 'palette.js'), 'export default "#405060";');
  editor.update(source.replace('/>', '>Updated</p>'));
  assert.match(preview(editor.hover('cl-brand')), /#405060/);
});

test('imported literal metadata changes update previews without executing application expressions', (t) => {
  const fs = require('node:fs'),
    path = require('node:path');
  const { root } = hoverProject(t, '{}');
  fs.writeFileSync(
    path.join(root, 'palette.ts'),
    `export const color = '#102030' as const;`,
  );
  fs.writeFileSync(
    path.join(root, 'vbox.config.ts'),
    `import { defineConfig } from '@veebox/core'; import { color } from './palette'; export default defineConfig({ theme: { color: { brand: color } } });`,
  );
  const source = `<template><p :title="(() => { throw new Error('must never execute'); return 'cl-brand'; })()"/></template>`;
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('cl-brand')), /#102030/);
  fs.writeFileSync(
    path.join(root, 'palette.ts'),
    `export const color = '#405060' as const;`,
  );
  editor.projectChanged();
  assert.match(preview(editor.hover('cl-brand')), /#405060/);
});

test('authored types resembling editor helper names do not break previews or diagnostics', (t) => {
  const source = `<script setup lang="ts">type __vboxHoverConfig = { label: string }; const value: __vboxHoverConfig = { label: 'Save' };</script><template><p vb-color="cl-brand">{{ value.label }}</p></template>`;
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('cl-brand')), /#123456/);
  assert.deepEqual(editor.diagnostics(), []);
  assert.deepEqual(editor.suggestions(), []);
});

test('widened config values identify their snapshot instead of pretending to be live', (t) => {
  const fs = require('node:fs'),
    path = require('node:path');
  const { root } = hoverProject(t, '{}');
  fs.writeFileSync(
    path.join(root, 'vbox.config.ts'),
    `export default { theme: { color: { brand: '#123456' } } };`,
  );
  const editor = createEditor(
    '<template><p title="cl-brand"/></template>',
    root,
  );
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('cl-brand')), /#123456.*snapshot.*widened/);
});

test('non-color references resolve through color references without adopting color-variable semantics', (t) => {
  const { root } = hoverProject(
    t,
    `{ enableDefaultTheme: false, theme: { color: { base: '#123456', alias: '$color.base' }, boxShadow: { accent: '$color.alias' } } }`,
  );
  const editor = createEditor(
    '<template><p vb-box-shadow="bs-accent" vb-color="cl-alias"/></template>',
    root,
  );
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('bs-accent')), /#123456/);
  assert.doesNotMatch(preview(editor.hover('bs-accent')), /var\(--color/);
  assert.match(preview(editor.hover('cl-alias')), /var\(--color-base\)/);
});

test('an explicitly undefined theme flag preserves default-token previews and completions', (t) => {
  const { root, write } = hoverProject(t, '{}');
  const source = '<template><p title="fs-2xl" vb-font-size=""/></template>';
  const editor = createEditor(source, root);
  t.after(() => editor.dispose());
  assert.match(preview(editor.hover('fs-2xl')), /1\.5rem/);
  write('{ enableDefaultTheme: undefined }');
  editor.projectChanged();
  assert.match(preview(editor.hover('fs-2xl')), /1\.5rem/);
  assert.ok(editor.completeAt(source.indexOf('""') + 1).includes('fs-2xl'));
});

test('non-transformed native tags and similarly named components still have informational previews', (t) => {
  const editor = createEditor('<template><p/></template>');
  t.after(() => editor.dispose());
  for (const tag of ['meta', 'link', 'Title', 'Style', 'Script']) {
    const source = `<template><${tag} content="cl-brand" /></template>`;
    editor.update(source);
    assert.match(preview(editor.hover('cl-brand')), /#123456/, tag);
  }
});

test('every character of an entity-encoded token can open its full-span preview', (t) => {
  const source = '<template><p title="cl&#45;brand"/></template>';
  const token = 'cl&#45;brand';
  const start = source.indexOf(token);
  const editor = createEditor(source);
  t.after(() => editor.dispose());
  for (let index = 0; index < token.length; index++) {
    const info = editor.hoverAt(start + index);
    assert.match(preview(info), /#123456/, `character ${index}`);
    assert.deepEqual(info.textSpan, { start, length: token.length });
  }
});
