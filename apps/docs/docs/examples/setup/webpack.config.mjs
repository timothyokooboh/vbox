import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { vboxWebpackPlugin } from '@veebox/unplugin/webpack';
const root = fileURLToPath(new URL('.', import.meta.url));
export default {
  context: root,
  mode: 'production',
  entry: './main.ts',
  output: {
    path: fileURLToPath(new URL('./dist', import.meta.url)),
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
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true,
          compilerOptions: { noEmit: false },
        },
      },
    ],
  },
  plugins: [
    vboxWebpackPlugin({ rootDir: root, configPath: './theme/vbox.config.ts' }),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    }),
    new HtmlWebpackPlugin({
      templateContent:
        '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VBox setup</title></head><body><div id="app"></div></body></html>',
    }),
  ],
};
