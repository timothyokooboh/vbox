const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

test('vue-tsc completes without swallowed editor-plugin exceptions', (t) => {
  const root = fs.mkdtempSync(path.resolve(__dirname, '../.editor-cli-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({ extends: '../tsconfig.json', include: ['Consumer.vue'] }),
  );
  fs.writeFileSync(
    path.join(root, 'Consumer.vue'),
    `<script setup lang="ts">type __vboxConfig = { message: string }; const value: __vboxConfig = { message: 'Hello' };</script><template><p :vb="{ hover: { color: 'cl-brand' } }">{{ value.message }}</p></template>`,
  );
  const result = spawnSync(
    process.execPath,
    [
      require.resolve('vue-tsc/bin/vue-tsc.js'),
      '--noEmit',
      '-p',
      path.join(root, 'tsconfig.json'),
    ],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(
    result.stderr.trim(),
    '',
    'CLI plugin exceptions must not be ignored even when vue-tsc exits zero',
  );
});
