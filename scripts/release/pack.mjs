import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const destination = path.resolve(process.argv[2] ?? '');
if (!process.argv[2])
  throw new Error('Provide a fresh tarball output directory.');
await fs.mkdir(destination);
const packages = [
  'core',
  'vue',
  'unplugin',
  'volar',
  'property-variance-authority',
];
const artifacts = {};
for (const name of packages) {
  const cwd = path.join(repository, 'packages', name);
  const manifest = JSON.parse(
    await fs.readFile(path.join(cwd, 'package.json')),
  );
  execFileSync('pnpm', ['pack', '--pack-destination', destination], {
    cwd,
    stdio: 'inherit',
  });
  const archive = `${manifest.name.replace('@', '').replace('/', '-')}-${manifest.version}.tgz`;
  await fs.access(path.join(destination, archive));
  const sha256 = createHash('sha256')
    .update(await fs.readFile(path.join(destination, archive)))
    .digest('hex');
  artifacts[manifest.name] = { version: manifest.version, archive, sha256 };
}
await fs.writeFile(
  path.join(destination, 'artifacts.json'),
  JSON.stringify(artifacts, null, 2),
);
