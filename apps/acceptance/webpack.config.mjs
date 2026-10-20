import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { vboxWebpackPlugin } from '@veebox/unplugin/webpack';

const createConfig = (server) => ({
  name: server ? 'server' : 'client',
  mode: 'production',
  target: server ? 'node' : 'web',
  entry: server ? './src/entry-server.ts' : './src/entry-client.ts',
  output: {
    path: fileURLToPath(new URL(server ? './dist/server-webpack' : './dist/webpack', import.meta.url)),
    filename: server ? 'entry-server.cjs' : 'app.js',
    ...(server ? { library: { type: 'commonjs2' } } : {}),
    clean: true,
  },
  externals: server ? [({ request }, callback) => {
    const external = /^(vue(?:\/|$)|vue-router$|radix-vue$|@vue\/|@veebox\/)/.test(request ?? '');
    callback(null, external ? `commonjs ${request}` : undefined);
  }] : undefined,
  resolve: { extensions: ['.ts', '.js', '.vue'] },
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader', options: { isServerBuild: server } },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true,
          compilerOptions: { noEmit: false },
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    vboxWebpackPlugin(),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
    }),
    ...(!server ? [new HtmlWebpackPlugin({
      templateContent: '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>VBox acceptance</title><!--ssr-head--></head><body><div id="app"><!--ssr-body--></div></body></html>',
      minify: false,
    })] : []),
  ],
});

export default [createConfig(false), createConfig(true)];
