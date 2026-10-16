import fs from 'node:fs/promises';
import path from 'node:path';
import WebpackDevServer from 'webpack-dev-server';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import webpack from 'webpack';
import { VueLoaderPlugin } from 'vue-loader';
import { vboxVitePlugin, vboxWebpackPlugin } from '@veebox/unplugin';

const require = createRequire(import.meta.url);
const config = (property: string, color: string) =>
  `export default { enableDefaultTheme: false, aliases: { values: { accent: '${property}' } }, theme: { color: { brand: '${color}' } } };`;

const appSource = (
  size = '32px',
) => `<script setup>import { ref } from 'vue'; const count = ref(0);</script>
<template><p vb-accent="${size}" vb-color="cl-brand">Live config</p><button @click="count++">Count {{ count }}</button></template>`;

export async function startDevFixture(driver: 'vite' | 'webpack') {
  const root = await fs.mkdtemp(path.resolve('.dev-case-'));
  const file = path.join(root, 'vbox.config.js');
  const index =
    '<!doctype html><html><head><title>Config updates</title></head><body><div id="app"></div><script type="module" src="/main.js"></script></body></html>';
  await fs.writeFile(path.join(root, 'package.json'), '{"type":"module"}');
  await fs.writeFile(path.join(root, 'index.html'), index);
  await fs.writeFile(file, config('width', 'red'));
  await fs.writeFile(path.join(root, 'App.vue'), appSource());
  await fs.writeFile(
    path.join(root, 'main.js'),
    `import { createApp } from 'vue'; import { VBoxPlugin } from '@veebox/vue'; import App from './App.vue'; import config from './vbox.config.js'; createApp(App).use(VBoxPlugin, config).mount('#app');`,
  );
  const remove = () => fs.rm(root, { recursive: true, force: true });
  if (driver === 'vite') {
    const server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [vboxVitePlugin(), vue()],
      server: { host: '127.0.0.1', port: 0 },
    });
    try {
      await server.listen();
    } catch (error) {
      await server.close();
      await remove();
      throw error;
    }
    const address = server.httpServer!.address() as { port: number };
    return {
      url: `http://127.0.0.1:${address.port}`,
      update: () => fs.writeFile(file, config('height', 'blue')),
      updateSource: () =>
        fs.writeFile(path.join(root, 'App.vue'), appSource('64px')),
      close: async () => {
        await server.close();
        await remove();
      },
    };
  }
  const output = path.join(root, 'dist');
  const compiler = webpack({
    mode: 'development',
    context: root,
    entry: './main.js',
    output: { path: output, filename: 'main.js' },
    module: {
      rules: [{ test: /\.vue$/, loader: require.resolve('vue-loader') }],
    },
    plugins: [
      vboxWebpackPlugin(),
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
      }),
    ],
  });
  const server = new WebpackDevServer(
    {
      host: '127.0.0.1',
      port: 0,
      hot: true,
      static: { directory: root, watch: false },
      devMiddleware: { stats: 'errors-only' },
      client: { logging: 'none', overlay: false },
    },
    compiler,
  );
  const close = async () => {
    await server.stop();
    await new Promise<void>((resolve) => compiler.close(() => resolve()));
    await remove();
  };
  try {
    await server.start();
  } catch (error) {
    await close();
    throw error;
  }
  const address = server.server!.address() as { port: number };
  return {
    url: `http://127.0.0.1:${address.port}`,
    update: () => fs.writeFile(file, config('height', 'blue')),
    updateSource: () =>
      fs.writeFile(path.join(root, 'App.vue'), appSource('64px')),
    close,
  };
}
