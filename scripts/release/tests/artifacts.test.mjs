import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const directory = process.env.VBOX_TARBALL_DIR;
if (!directory)
  throw new Error('VBOX_TARBALL_DIR must name freshly packed artifacts.');
const artifacts = JSON.parse(
  fs.readFileSync(path.join(directory, 'artifacts.json')),
);
for (const [name, artifact] of Object.entries(artifacts)) {
  test(`${name} installs from prebuilt files without workspace tooling`, () => {
    const archive = path.join(directory, artifact.archive);
    const entries = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' })
      .trim()
      .split('\n');
    const manifest = JSON.parse(
      execFileSync('tar', ['-xOf', archive, 'package/package.json'], {
        encoding: 'utf8',
      }),
    );
    assert.ok(
      entries.includes('package/LICENSE'),
      'distribution includes its declared license notice',
    );
    assert.equal(manifest.version, artifact.version);
    assert.equal(manifest.engines.node, '>=22.14.0');
    assert.ok(
      entries.every(
        (file) => !/(?:^|\/)(?:node_modules|src|\.env)(?:\/|$)/.test(file),
      ),
      'no unpublished source or environment files',
    );
    for (const hook of ['preinstall', 'install', 'postinstall'])
      assert.equal(
        manifest.scripts?.[hook],
        undefined,
        `${name} must not run ${hook} on consumer machines`,
      );
    for (const range of Object.values(manifest.dependencies ?? {}))
      assert.doesNotMatch(range, /workspace:|link:/);
    const exportedFiles = (value) =>
      typeof value === 'string'
        ? [value]
        : Object.values(value).flatMap(exportedFiles);
    for (const file of exportedFiles(manifest.exports))
      assert.ok(
        entries.includes(`package/${file.replace(/^\.\//, '')}`),
        `missing export ${file}`,
      );
    for (const file of Object.values(manifest.bin ?? {}))
      assert.ok(
        entries.includes(`package/${file}`),
        `missing executable ${file}`,
      );
    if (['@veebox/core', '@veebox/vue'].includes(name)) {
      assert.match(manifest.exports['.'].require, /\.cjs$/);
      assert.ok(entries.includes('package/dist/index.umd.js'));
    }
    if (name === '@veebox/core')
      assert.ok(
        manifest.dependencies.csstype,
        'public declarations require csstype in consumer dependencies',
      );
  });
}
