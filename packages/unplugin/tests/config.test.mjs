import test from 'node:test';
import { parse } from '@vue/compiler-sfc';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { transformVueSfc } from '../dist/transform.js';

function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vbox-config-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return {
    root,
    config: path.join(root, 'vbox.config.ts'),
    file: path.join(root, 'View.vue'),
  };
}

test('discovered alias metadata refreshes after config edits in the same process', (t) => {
  const p = project(t);
  const source = '<template><p first="red" second="blue" /></template>';
  fs.writeFileSync(
    p.config,
    'export default { aliases: { values: { first: "color" } } }',
  );
  assert.match(transformVueSfc(source, p.file).code, /'first': 'red'/);
  fs.writeFileSync(
    p.config,
    'export default { aliases: { values: { second: "color" } } }',
  );
  assert.match(transformVueSfc(source, p.file).code, /'second': 'blue'/);
});

test('explicit metadata replaces discovery including an empty list; explicit styling needs neither', (t) => {
  const p = project(t);
  fs.writeFileSync(
    p.config,
    'export default { aliases: { values: { first: "color" } } }',
  );
  const source = '<template><p first="red" /></template>';
  assert.equal(transformVueSfc(source, p.file, { aliases: [] }), null);
  const explicit = transformVueSfc(
    '<template><p vb-first="red" /></template>',
    p.file,
    { aliases: [] },
  );
  assert.ok(
    parse(explicit.code).descriptor.template.ast.children[0].props.some(
      (prop) => prop.type === 7 && prop.exp?.content.includes('"first"'),
    ),
  );
  assert.ok(!explicit.code.includes('vb-first='));
});

test('configPath and rootDir select non-standard locations without process-wide leakage', (t) => {
  const a = project(t);
  const b = project(t);
  fs.writeFileSync(
    a.config,
    'export default { aliases: { values: { first: "color" } } }',
  );
  fs.writeFileSync(
    b.config,
    'export default { aliases: { values: { second: "color" } } }',
  );
  const source = '<template><p first="red" second="blue" /></template>';
  const out = transformVueSfc(source, a.file, {
    rootDir: b.root,
    configPath: './vbox.config.ts',
  });
  assert.match(out.code, /'second': 'blue'/);
  assert.ok(out.code.includes('first="red"'));
  assert.deepEqual(out.dependencies, [b.config]);
});

test('bad configuration is diagnosed with its path and can recover without restarting', (t) => {
  const p = project(t);
  const source = '<template><p vb-color="red" /></template>';
  fs.writeFileSync(p.config, 'export default { broken:');
  assert.throws(
    () => transformVueSfc(source, p.file),
    (error) =>
      error.message.includes(p.config) && /Failed to load/.test(error.message),
  );
  fs.writeFileSync(
    p.config,
    'export default { aliases: { values: { hover: "color" } } }',
  );
  assert.throws(
    () => transformVueSfc(source, p.file),
    /aliases.values.*hover.*reserved condition/,
  );
  fs.writeFileSync(p.config, 'export default {}');
  assert.ok(transformVueSfc(source, p.file));
});
