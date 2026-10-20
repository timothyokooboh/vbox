import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import * as Vue from 'vue';
const require = createRequire(import.meta.url);
for (const name of [
  'core',
  'vue',
  'unplugin',
  'volar',
  'property-variance-authority',
]) {
  const id = `@veebox/${name}`;
  const entry = fs.realpathSync(require.resolve(id));
  assert.ok(
    entry.startsWith(`${process.cwd()}${path.sep}`),
    `consumer leaked workspace resolution: ${entry}`,
  );
  assert.ok(Object.keys(await import(id)).length);
  assert.ok(Object.keys(require(id)).length);
  if (name === 'core' || name === 'vue') {
    assert.match(entry, /\.cjs$/);
    const context = vm.createContext({ Vue, console });
    vm.runInContext(
      fs.readFileSync(path.join(path.dirname(entry), 'index.umd.js'), 'utf8'),
      context,
    );
    assert.ok(
      Object.keys(context).some((key) => !['Vue', 'console'].includes(key)),
      'UMD exposes a browser global',
    );
  }
}
for (const entry of ['vite', 'webpack', 'transform']) {
  const esm = await import(`@veebox/unplugin/${entry}`);
  assert.ok(Object.keys(esm).length);
  assert.ok(Object.keys(require(`@veebox/unplugin/${entry}`)).length);
}
const { transformVueSfc } = await import('@veebox/unplugin/transform');
assert.match(
  transformVueSfc('<template><p vb-color="red" /></template>', 'Example.vue')
    .code,
  /useVBoxStyleBinding|withVBoxStyleBinding/,
);
assert.match(fs.readFileSync('vbox.d.ts', 'utf8'), /"brand": "#123456"/);
console.log(`Packed module entries verified on ${process.version}`);
