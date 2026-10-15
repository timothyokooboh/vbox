import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import {
  VBoxPlugin,
  useVBoxStyleBinding,
  getSSRStyles,
  getSSRCollector,
} from '@veebox/vue';
import { resolveVBoxConfig } from '@veebox/core';

async function consumer(property, color) {
  const config = {
    enableDefaultTheme: false,
    aliases: { values: { accent: property } },
    theme: { color: { brand: color } },
  };
  const app = createSSRApp({
    setup() {
      const bind = useVBoxStyleBinding();
      return () =>
        h('p', bind({ accent: '20px', color: 'cl-brand' }), 'Consumer');
    },
  }).use(VBoxPlugin, config);
  const context = {};
  getSSRCollector(context).collect(resolveVBoxConfig(config).themeCss);
  const html = await renderToString(app, context);
  return { html, css: getSSRStyles(context) };
}

test('two configured SSR consumers retain independent alias identity and token CSS', async () => {
  const a = await consumer('width', 'red');
  const b = await consumer('height', 'blue');
  const again = await consumer('width', 'red');
  assert.notEqual(
    a.html,
    b.html,
    'classes must encode configuration meaning, not just raw style keys',
  );
  assert.match(a.css, /width:\s*20px/);
  assert.doesNotMatch(a.css, /height:\s*20px|--color-brand:\s*blue/);
  assert.match(b.css, /height:\s*20px/);
  assert.match(b.css, /--color-brand:\s*blue/);
  assert.deepEqual(again, a);
});

test('effective theme, alias strategy and breakpoint options share one core vocabulary', () => {
  const config = resolveVBoxConfig({
    enableDefaultTheme: false,
    aliases: { strategy: 'replace', values: { 'pad-2': 'padding' } },
    theme: {
      color: {
        brand: { default: '#123456', dark: '#abcdef' },
        reference: '$color.brand',
      },
      spacing: { large: '24px', larger: '$spacing.large' },
    },
    breakpoints: { md: '51rem' },
  });
  assert.equal(config.aliases.pad2, 'padding');
  assert.equal(config.aliases.bg, undefined);
  assert.equal(config.normalized.spacing.larger, '24px');
  assert.equal(config.normalized.color.reference, 'var(--color-brand)');
  assert.equal(config.normalized.color['red-500'], undefined);
  assert.equal(config.colorDarkMap.brand, '#abcdef');
  assert.equal(config.breakpoints.sm, '40rem');
  assert.equal(config.breakpoints.md, '51rem');
  assert.ok(resolveVBoxConfig().normalized.color['red-500']);
});

test('the public type-generation command uses explicit config and emits valid custom vocabulary', async (t) => {
  const { default: fs } = await import('node:fs');
  const { default: path } = await import('node:path');
  const { execFileSync } = await import('node:child_process');
  const { default: ts } = await import('typescript');
  const root = fs.mkdtempSync(path.resolve('.type-case-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, 'theme.js'),
    `export default { enableDefaultTheme: false, aliases: { values: { 'corner-round': 'borderRadius' } }, theme: { fontSize: { large: '2rem', big: '$fontSize.large' } } };`,
  );
  execFileSync(
    'pnpm',
    ['exec', 'vbox-type-gen', '--root', root, '--config', 'theme.js'],
    { stdio: 'pipe' },
  );
  const declaration = path.join(root, 'vbox.d.ts');
  const emitted = fs.readFileSync(declaration, 'utf8');
  assert.match(emitted, /"corner-round": "borderRadius"/);
  assert.match(emitted, /"big": "2rem"/);
  const consumer = path.join(root, 'consumer.ts');
  fs.writeFileSync(
    consumer,
    `import type { VBoxStyleProps } from '@veebox/core'; const styles: VBoxStyleProps = { 'corner-round': '10px', fontSize: 'fs-big' }; void styles;`,
  );
  const program = ts.createProgram([declaration, consumer], {
    noEmit: true,
    strict: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  });
  assert.deepEqual(
    ts
      .getPreEmitDiagnostics(program)
      .map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')),
    [],
  );
});
