import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { vboxWebpackPlugin } from '@veebox/unplugin/webpack';

export default {
  mode: 'production',
  entry: './src/entry-client.ts',
  output: {
    path: fileURLToPath(new URL('./dist/webpack', import.meta.url)),
    filename: 'app.js',
    clean: true,
  },
  resolve: { extensions: ['.ts', '.js', '.vue'] },
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader' },
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
    new HtmlWebpackPlugin({
      templateContent:
        '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>VBox acceptance</title><!--ssr-head--></head><body><div id="app"><!--ssr-body--></div></body></html>',
      minify: false,
    }),
  ],
};
