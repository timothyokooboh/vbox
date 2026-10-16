import { test, expect } from '../browser/fixtures';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { build, preview } from 'vite';
import { compileWebpack } from '../support/webpack.mjs';

for (const bundler of ['vite', 'webpack']) {
  test.describe(`copyable ${bundler} setup`, () => {
    let root: string;
    let server: Awaited<ReturnType<typeof preview>>;
    test.beforeAll(async () => {
      // Keep Vite's root and resolved HTML paths identical on macOS (/var -> /private/var).
      root = await fs.realpath(
        await fs.mkdtemp(path.join(os.tmpdir(), 'vbox-docs-setup-')),
      );
      await fs.cp(path.resolve('../docs/docs/examples/setup'), root, {
        recursive: true,
      });
      const manifest = JSON.parse(
        await fs.readFile(path.join(root, 'package.json'), 'utf8'),
      );
      for (const name of Object.keys({
        ...manifest.dependencies,
        ...manifest.devDependencies,
      })) {
        const target = path.join(root, 'node_modules', name);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.symlink(
          await fs.realpath(path.resolve('node_modules', name)),
          target,
          'dir',
        );
      }
      for (const args of [
        ['vbox-type-gen', '--config', './theme/vbox.config.ts'],
        ['vue-tsc', '--noEmit', '-p', 'tsconfig.json'],
      ]) {
        const result = spawnSync(
          path.resolve('node_modules/.bin', args[0]),
          args.slice(1),
          { cwd: root, encoding: 'utf8' },
        );
        expect(result.status, result.stdout + result.stderr).toBe(0);
        expect(result.stderr).not.toMatch(
          /Failed to create|plugin.*(?:Error|exception)/i,
        );
      }
      if (bundler === 'vite') {
        await build({
          root,
          configFile: path.join(root, 'vite.config.ts'),
          logLevel: 'silent',
        });
      } else {
        const { default: config } = await import(
          pathToFileURL(path.join(root, 'webpack.config.mjs')).href
        );
        await compileWebpack(config);
      }
      server = await preview({
        root,
        configFile: false,
        preview: { host: '127.0.0.1', port: 0 },
      });
    });
    test.afterAll(async () => {
      if (server)
        await new Promise<void>((resolve) => {
          server.httpServer.closeAllConnections();
          server.httpServer.close(() => resolve());
        });
      if (root) await fs.rm(root, { recursive: true, force: true });
    });
    test('builds and typechecks the documented files, then renders semantic bindings, aliases and theme tokens', async ({
      page,
    }) => {
      await page.goto(server.resolvedUrls!.local[0]);
      const button = page.getByRole('button', { name: 'Save', exact: true });
      await expect(button).toHaveAttribute('translate', 'no');
      await expect(button).toHaveCSS('translate', '8px');
      await expect(button).toHaveCSS('color', 'rgb(18, 52, 86)');
      await expect(button).toHaveCSS('padding', '12px');
      await expect(page.locator('body')).toHaveCSS('margin', '0px');
      await button.click();
      await expect(page.getByRole('status')).toHaveText('Saved 1');
      await page.getByRole('button', { name: 'Toggle theme' }).click();
      await expect(button).toHaveCSS('color', 'rgb(171, 205, 239)');
    });
  });
}
