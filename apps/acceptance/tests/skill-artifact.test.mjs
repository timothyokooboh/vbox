import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { transformVueSfc } from '@veebox/unplugin';

const repository = path.resolve('../..');
test('prepared skill is self-contained, source-aligned, and ships compilable native examples', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vbox-skill-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const output = path.join(root, 'vbox-native');
  const result = spawnSync(
    process.execPath,
    [path.join(repository, 'scripts/build-native-skill.mjs'), output],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(output, 'compatibility.json'), 'utf8'),
  );
  assert.equal(manifest.contract, 'explicit-native-v1');
  assert.equal(manifest.releaseStatus, 'unreleased');
  assert.equal(manifest.supportedPublishedRange, null);
  assert.match(manifest.sourceRevision, /^[a-f0-9]{40}$/);
  for (const [relative, digest] of Object.entries(manifest.canonicalSources)) {
    const canonical = fs.readFileSync(path.join(repository, relative), 'utf8');
    assert.equal(createHash('sha256').update(canonical).digest('hex'), digest);
    const bundled = fs.readFileSync(
      path.join(output, 'references', path.basename(relative)),
      'utf8',
    );
    const fences = (text) =>
      [...text.matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)].map(
        (match) => match[1],
      );
    for (const block of fences(canonical))
      assert.ok(
        fences(bundled).includes(block),
        `fenced example changed in ${relative}`,
      );
    for (const inclusion of canonical.matchAll(/^<<<\s+@\/(.+)$/gm)) {
      const source = path.resolve(repository, 'apps/docs/docs', inclusion[1]);
      const imported = fs.readFileSync(source, 'utf8');
      assert.ok(
        bundled.includes(imported.trimEnd()),
        `missing imported example ${inclusion[1]}`,
      );
      assert.equal(
        manifest.includedSources[path.relative(repository, source)],
        createHash('sha256').update(imported).digest('hex'),
      );
    }
  }
  const skill = fs.readFileSync(path.join(output, 'SKILL.md'), 'utf8');
  assert.match(skill, /^---\nname: vbox-native\n/);
  for (const entry of fs.readdirSync(output, { recursive: true })) {
    if (!entry.endsWith('.md')) continue;
    const file = path.join(output, entry);
    for (const match of fs
      .readFileSync(file, 'utf8')
      .matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      if (/^(?:https?:|#)/.test(match[1])) continue;
      assert.ok(
        fs.existsSync(path.resolve(path.dirname(file), match[1].split('#')[0])),
        `${entry}: missing ${match[1]}`,
      );
    }
  }
  const examples = fs
    .readdirSync(path.join(output, 'examples'))
    .filter((name) => name.endsWith('.vue'));
  assert.ok(examples.length >= 4);
  const retry = spawnSync(
    process.execPath,
    [path.join(repository, 'scripts/build-native-skill.mjs'), output],
    { encoding: 'utf8' },
  );
  assert.notEqual(
    retry.status,
    0,
    'building must not overwrite an existing installation',
  );
  assert.match(retry.stderr, /EEXIST/);
  assert.equal(fs.readFileSync(path.join(output, 'SKILL.md'), 'utf8'), skill);
  for (const name of examples) {
    const file = path.join(output, 'examples', name);
    const source = fs.readFileSync(file, 'utf8');
    const transformed = transformVueSfc(source, file, {
      rootDir: process.cwd(),
    });
    assert.deepEqual(transformed?.warnings ?? [], [], name);
    const { descriptor, errors } = parse(transformed?.code ?? source, {
      filename: file,
    });
    assert.deepEqual(errors, [], name);
    const script = compileScript(descriptor, { id: name });
    const template = compileTemplate({
      filename: file,
      id: name,
      source: descriptor.template.content,
      compilerOptions: {
        bindingMetadata: script.bindings,
        expressionPlugins: ['typescript'],
      },
    });
    assert.deepEqual(template.errors, [], name);
  }
});
