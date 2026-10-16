import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import webpack from 'webpack';
import { build as viteBuild } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vboxVitePlugin, vboxWebpackPlugin } from '@veebox/unplugin';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { VueLoaderPlugin } from 'vue-loader';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { VBoxPlugin, getSSRStyles } from '@veebox/vue';

const require = createRequire(import.meta.url);

async function compile(config) {
  const compiler = webpack(config);
  try {
    return await new Promise((resolve, reject) =>
      compiler.run((error, stats) => {
        if (error || stats.hasErrors())
          reject(error ?? new Error(stats.toString('errors-only')));
        else resolve(stats);
      }),
    );
  } finally {
    await new Promise((resolve) => compiler.close(resolve));
  }
}

test('installed webpack artifact resolves its loader inside a project path containing spaces', async (t) => {
  const root = await fs.mkdtemp(path.resolve('.build case-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const artifact = path.join(root, 'node_modules/@veebox/unplugin');
  await fs.mkdir(artifact, { recursive: true });
  const sourcePackage = path.resolve('../../packages/unplugin');
  await fs.cp(path.join(sourcePackage, 'dist'), path.join(artifact, 'dist'), {
    recursive: true,
  });
  await fs.copyFile(
    path.join(sourcePackage, 'package.json'),
    path.join(artifact, 'package.json'),
  );
  await fs.symlink(
    path.join(sourcePackage, 'node_modules'),
    path.join(artifact, 'node_modules'),
    'dir',
  );
  const consumer = createRequire(path.join(root, 'entry.cjs'));
  const rootExports = await import(
    pathToFileURL(consumer.resolve('@veebox/unplugin')).href
  );
  const { vboxWebpackPlugin } = await import(
    pathToFileURL(consumer.resolve('@veebox/unplugin/webpack')).href
  );
  assert.equal(typeof rootExports.vboxVitePlugin, 'function');
  assert.equal(typeof rootExports.vboxWebpackPlugin, 'function');
  const { vboxVitePlugin } = await import(
    pathToFileURL(consumer.resolve('@veebox/unplugin/vite')).href
  );
  assert.equal(typeof vboxVitePlugin, 'function');
  await fs.writeFile(
    path.join(root, 'App.vue'),
    '<template><p vb-color="red" title="semantic">Installed artifact</p></template>',
  );
  await compile({
    context: root,
    mode: 'production',
    target: 'node',
    entry: './App.vue',
    output: {
      path: path.join(root, 'dist'),
      filename: 'component.cjs',
      library: { type: 'commonjs2' },
    },
    externals: {
      vue: 'commonjs vue',
      '@veebox/vue': 'commonjs @veebox/vue',
      'vue/server-renderer': 'commonjs vue/server-renderer',
    },
    module: {
      rules: [{ test: /\.vue$/, loader: require.resolve('vue-loader') }],
    },
    plugins: [vboxWebpackPlugin(), new VueLoaderPlugin()],
  });
  const { default: output } = await import(
    pathToFileURL(path.join(root, 'dist/component.cjs')).href
  );
  const context = {};
  const html = await renderToString(
    createSSRApp(output.default).use(VBoxPlugin, { enableDefaultTheme: false }),
    context,
  );
  assert.match(html, /title="semantic"/);
  assert.match(html, /Installed artifact/);
  assert.doesNotMatch(html, /vb-color/);
  assert.match(getSSRStyles(context), /color:red/);
});

for (const driver of ['vite', 'webpack']) {
  test(`${driver} production maps point back to authored script and moved template expressions`, async (t) => {
    const root = await fs.mkdtemp(path.resolve('.map-case-'));
    t.after(() => fs.rm(root, { recursive: true, force: true }));
    const source = `<script>
const message = 'authored-script-probe';
export default { data: () => ({ message }) };
</script>
<template>
  <p :vb-color="String(templateMapProbe)">{{ message }}</p>
</template>`;
    await fs.writeFile(path.join(root, 'App.vue'), source);
    const output = path.join(root, 'dist');
    if (driver === 'vite') {
      await viteBuild({
        root,
        configFile: false,
        logLevel: 'silent',
        plugins: [vboxVitePlugin(), vue()],
        build: {
          ssr: path.join(root, 'App.vue'),
          outDir: output,
          sourcemap: true,
          minify: false,
          rollupOptions: { output: { entryFileNames: 'bundle.js' } },
        },
      });
    } else {
      await compile({
        context: root,
        mode: 'production',
        target: 'node',
        entry: './App.vue',
        devtool: 'source-map',
        optimization: { minimize: false },
        output: {
          path: output,
          filename: 'bundle.js',
          library: { type: 'commonjs2' },
        },
        externals: {
          vue: 'commonjs vue',
          '@veebox/vue': 'commonjs @veebox/vue',
          'vue/server-renderer': 'commonjs vue/server-renderer',
        },
        module: {
          rules: [{ test: /\.vue$/, loader: require.resolve('vue-loader') }],
        },
        plugins: [vboxWebpackPlugin(), new VueLoaderPlugin()],
      });
    }
    const code = await fs.readFile(path.join(output, 'bundle.js'), 'utf8');
    const map = new TraceMap(
      JSON.parse(await fs.readFile(path.join(output, 'bundle.js.map'), 'utf8')),
    );
    for (const token of ['authored-script-probe', 'templateMapProbe']) {
      const generated = code.indexOf(token);
      assert.ok(generated >= 0, `bundle contains ${token}`);
      const lines = code.slice(0, generated).split('\n');
      const actual = originalPositionFor(map, {
        line: lines.length,
        column: lines.at(-1).length,
      });
      const expectedLine = source
        .slice(0, source.indexOf(token))
        .split('\n').length;
      assert.equal(
        actual.line,
        expectedLine,
        `${driver} ${token} maps to its authored line`,
      );
      assert.ok(
        actual.source?.includes('App.vue'),
        `${driver} maps to the original SFC`,
      );
    }
  });
}

for (const driver of ['vite', 'webpack']) {
  test(`${driver} rejects invalid styling at the authored attribute location`, async (t) => {
    const root = await fs.mkdtemp(path.resolve('.diagnostic-case-'));
    t.after(() => fs.rm(root, { recursive: true, force: true }));
    const filename = path.join(root, 'App.vue');
    await fs.writeFile(
      filename,
      '<template>\n  <button\n    vb-hover="{}" />\n</template>',
    );
    const build =
      driver === 'vite'
        ? () =>
            viteBuild({
              root,
              configFile: false,
              logLevel: 'silent',
              plugins: [vboxVitePlugin(), vue()],
              build: { ssr: filename, outDir: path.join(root, 'dist') },
            })
        : () =>
            compile({
              context: root,
              mode: 'production',
              target: 'node',
              entry: './App.vue',
              output: { path: path.join(root, 'dist') },
              module: {
                rules: [
                  { test: /\.vue$/, loader: require.resolve('vue-loader') },
                ],
              },
              plugins: [vboxWebpackPlugin(), new VueLoaderPlugin()],
            });
    await assert.rejects(build, (error) => {
      assert.ok(error.message.includes(`${filename}:3:5`), error.message);
      assert.match(error.message, /requires an object binding/);
      return true;
    });
  });
}
