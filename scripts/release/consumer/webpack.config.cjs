const path = require('node:path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { vboxWebpackPlugin } = require('@veebox/unplugin/webpack');
module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    path: path.resolve('dist/webpack'),
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
      },
    ],
  },
  plugins: [
    vboxWebpackPlugin(),
    new VueLoaderPlugin(),
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
    }),
    new HtmlWebpackPlugin({
      templateContent:
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Packed VBox</title></head><body><div id="app"></div></body></html>',
    }),
  ],
};
