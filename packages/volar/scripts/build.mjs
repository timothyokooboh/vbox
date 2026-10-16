import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });
for (const name of await fs.readdir(srcDir)) {
  if (name.endsWith('.cjs'))
    await fs.copyFile(path.join(srcDir, name), path.join(distDir, name));
}
await fs.copyFile(
  path.join(srcDir, 'index.d.ts'),
  path.join(distDir, 'index.d.ts'),
);
