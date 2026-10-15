import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import webpack from 'webpack';
import { VueLoaderPlugin } from 'vue-loader';
import { vboxVitePlugin, vboxWebpackPlugin } from '@veebox/unplugin';

const require = createRequire(import.meta.url);
const config = (property: string, color: string) =>
  `export default { enableDefaultTheme: false, aliases: { values: { accent: '${property}' } }, theme: { color: { brand: '${color}' } } };`;

export async function startDevFixture(driver: 'vite' | 'webpack') {
  const root = await fs.mkdtemp(path.resolve('.dev-case-'));
  const file = path.join(root, 'vbox.config.js');
  const index =
    '<!doctype html><html><head><title>Config updates</title></head><body><div id="app"></div><script type="module" src="/main.js"></script></body></html>';
  await fs.writeFile(path.join(root, 'package.json'), '{"type":"module"}');
  await fs.writeFile(path.join(root, 'index.html'), index);
  await fs.writeFile(file, config('width', 'red'));
  await fs.writeFile(
    path.join(root, 'App.vue'),
    '<template><p vb-accent="32px" vb-color="cl-brand">Live config</p></template>',
  );
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
  let resolveBuild: () => void;
  let rejectBuild: (error: Error) => void;
  const nextBuild = () =>
    new Promise<void>((resolve, reject) => {
      resolveBuild = resolve;
      rejectBuild = reject;
    });
  const first = nextBuild();
  const watcher = compiler.watch({}, (error, stats) => {
    if (error || stats?.hasErrors())
      rejectBuild(error ?? new Error(stats!.toString('errors-only')));
    else resolveBuild();
  });
  const server = http.createServer(async (request, response) => {
    try {
      if (request.url === '/main.js') {
        response.setHeader('Content-Type', 'text/javascript');
        response.end(await fs.readFile(path.join(output, 'main.js')));
      } else response.end(index);
    } catch (error) {
      response.statusCode = 500;
      response.end(String(error));
    }
  });
  const close = async () => {
    await new Promise<void>((resolve) => watcher.close(() => resolve()));
    await new Promise<void>((resolve) => compiler.close(() => resolve()));
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await remove();
  };
  try {
    await first;
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
  } catch (error) {
    await close();
    throw error;
  }
  const address = server.address() as { port: number };
  return {
    url: `http://127.0.0.1:${address.port}`,
    update: async () => {
      const built = nextBuild();
      await fs.writeFile(file, config('height', 'blue'));
      await built;
    },
    close,
  };
}
