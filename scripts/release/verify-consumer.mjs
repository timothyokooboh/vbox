import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const [directory, manager = 'npm'] = process.argv.slice(2);
if (!directory || !['npm', 'pnpm', 'yarn'].includes(manager))
  throw new Error(
    'Usage: node scripts/release/verify-consumer.mjs TARBALL_DIR npm|pnpm|yarn',
  );
const artifacts = JSON.parse(
  fs.readFileSync(path.resolve(directory, 'artifacts.json')),
);
for (const artifact of Object.values(artifacts)) {
  const digest = createHash('sha256')
    .update(fs.readFileSync(path.resolve(directory, artifact.archive)))
    .digest('hex');
  if (digest !== artifact.sha256)
    throw new Error(`Tarball checksum mismatch: ${artifact.archive}`);
}
const root = fs.mkdtempSync(
  path.join(os.tmpdir(), `vbox-installed-${manager}-`),
);
const dependencies = Object.fromEntries(
  Object.entries(artifacts).map(([name, { archive }]) => [
    name,
    `file:${path.resolve(directory, archive)}`,
  ]),
);
const tools = [
  '@types/node',
  'vue',
  '@vue/server-renderer',
  '@vue/compiler-sfc',
  '@vue/language-core',
  '@volar/typescript',
  '@playwright/test',
  'typescript',
  'vue-tsc',
  'vite',
  '@vitejs/plugin-vue',
  'webpack',
  'webpack-cli',
  'vue-loader',
  'ts-loader',
  'html-webpack-plugin',
];
for (const name of tools) {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(
        repository,
        'apps/acceptance/node_modules',
        name,
        'package.json',
      ),
    ),
  );
  dependencies[name] = manifest.version;
}
const overrides = Object.fromEntries(
  Object.keys(artifacts).map((name) => [name, dependencies[name]]),
);
const manifest = {
  name: 'vbox-clean-artifact-consumer',
  private: true,
  type: 'module',
  dependencies,
  ...(manager === 'npm'
    ? { overrides }
    : manager === 'pnpm'
      ? { pnpm: { overrides } }
      : { resolutions: overrides }),
};
fs.cpSync(path.join(repository, 'scripts/release/consumer'), root, {
  recursive: true,
});
fs.copyFileSync(
  path.join(repository, 'apps/acceptance/tests/support/editor-service.cjs'),
  path.join(root, 'editor-service.cjs'),
);
fs.writeFileSync(
  path.join(root, 'package.json'),
  JSON.stringify(manifest, null, 2),
);
// Deliberately omit global package-manager binaries from lifecycle PATH.
const bin = path.join(root, 'runner-bin');
fs.mkdirSync(bin);
fs.symlinkSync(process.execPath, path.join(bin, 'node'));
const env = {
  ...process.env,
  PATH: `${bin}:/usr/bin:/bin`,
  NODE_PATH: '',
  CI: 'true',
  npm_config_audit: 'false',
  npm_config_fund: 'false',
};
const managerPath =
  manager === 'npm'
    ? fs.realpathSync(path.join(path.dirname(process.execPath), 'npm'))
    : fs.realpathSync(
        execFileSync('which', [manager], { encoding: 'utf8' }).trim(),
      );
const run = (file, args = []) =>
  execFileSync(process.execPath, [file, ...args], {
    cwd: root,
    env,
    stdio: 'inherit',
  });
const runBinary = (name, args = []) =>
  execFileSync(path.join(root, 'node_modules/.bin', name), args, {
    cwd: root,
    env,
    stdio: 'inherit',
  });
console.log(
  JSON.stringify(
    { node: process.version, manager, root, artifacts, dependencies },
    null,
    2,
  ),
);
try {
  execFileSync(managerPath, ['--version'], {
    cwd: root,
    env,
    stdio: 'inherit',
  });
  execFileSync(
    managerPath,
    manager === 'yarn'
      ? ['install', '--non-interactive', '--prefer-offline']
      : manager === 'pnpm'
        ? [
            'install',
            '--prefer-offline',
            '--config.manage-package-manager-versions=false',
          ]
        : ['install', '--prefer-offline'],
    { cwd: root, env, stdio: 'inherit' },
  );
  runBinary('vbox-type-gen');
  run('modules.mjs');
  runBinary('vue-tsc', ['--noEmit']);
  runBinary('tsc', [
    '--noEmit',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    '--target',
    'ES2022',
    '--skipLibCheck',
    'false',
    'types.mts',
    'types.cts',
  ]);
  run('editor.cjs');
  run('environment.mjs');
  runBinary('vite', ['build']);
  runBinary('webpack', ['--config', 'webpack.config.cjs']);
  runBinary('webpack', ['--config', 'webpack.server.cjs']);
  runBinary('vite', [
    'build',
    '--ssr',
    'src/server.ts',
    '--outDir',
    'dist/server',
  ]);
  run('hydrate.mjs');
  if (process.env.VBOX_INSTALL_BROWSERS === '1')
    runBinary('playwright', ['install', 'chromium']);
  run('browser.mjs');
  console.log(`${manager}: clean artifact consumer passed`);
} finally {
  // This unique directory is created solely by this run, never a user's project.
  if (process.env.VBOX_KEEP_CONSUMER !== '1')
    fs.rmSync(root, { recursive: true, force: true });
  else console.log(`Preserved diagnostic consumer: ${root}`);
}
