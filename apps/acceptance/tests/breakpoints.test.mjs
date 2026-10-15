import test from 'node:test';
import assert from 'node:assert/strict';
import { defineConfig, resolveVBoxConfig } from '@veebox/core';
import { renderStyles } from './support/render-styles.mjs';

test('invalid breakpoint configuration produces actionable key-specific diagnostics', () => {
  for (const value of [
    '',
    ' ',
    'wide',
    '48',
    '50%',
    'calc()',
    'calc(40rem',
    '40rem);color:red',
    48,
    null,
    false,
  ]) {
    for (const configure of [defineConfig, resolveVBoxConfig])
      assert.throws(
        () => configure({ breakpoints: { md: value } }),
        /\[VBox\].*breakpoints\.md.*(length|threshold)/i,
      );
  }
  assert.throws(
    () => defineConfig({ breakpoints: { '2xl': '96rem' } }),
    /_2xl/,
  );
  for (const value of [null, false, []])
    assert.throws(
      () => defineConfig({ breakpoints: value }),
      /breakpoints.*object/i,
    );
});

test('partial configuration preserves units, default names and supported zero/negative lengths', () => {
  for (const md of [
    '50em',
    ' 48rem ',
    '0',
    '-10px',
    'calc(40rem + 1px)',
    'min(60rem, 1000px)',
    '48futureunit',
  ]) {
    const config = resolveVBoxConfig({ breakpoints: { md, sm: undefined } });
    assert.equal(config.breakpoints.md, md);
    assert.equal(config.breakpoints.sm, '40rem');
    assert.equal(config.breakpoints._2xl, '96rem');
  }
});

test('normalized theme/viewport/state identity stays config-scoped and repeatable across SSR requests', async () => {
  const a = { dark: { md: { hover: { color: 'blue' } } } };
  const b = { hover: { md: { dark: { color: 'blue' } } } };
  const first = await renderStyles(a, {}, { breakpoints: { md: '50em' } });
  const equivalent = await renderStyles(b, {}, { breakpoints: { md: '50em' } });
  const differentConfig = await renderStyles(
    a,
    {},
    { breakpoints: { md: '900px' } },
  );
  const repeated = await renderStyles(a, {}, { breakpoints: { md: '50em' } });
  assert.deepEqual(first, equivalent);
  assert.deepEqual(first, repeated);
  assert.notEqual(first.html, differentConfig.html);
  assert.match(first.css, /min-width:\s*50em/);
  assert.match(differentConfig.css, /min-width:\s*900px/);
});

test('plain exported config modules receive the same threshold diagnostics with their file path', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { loadVBoxConfig } = await import('@veebox/core/config');
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'vbox-breakpoint-config-'),
  );
  try {
    const file = path.join(root, 'vbox.config.mjs');
    fs.writeFileSync(file, 'export default { breakpoints: { md: "wide" } }');
    assert.throws(
      () => loadVBoxConfig({ configPath: file }),
      (error) =>
        error.message.includes(file) &&
        error.message.includes('breakpoints.md'),
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
