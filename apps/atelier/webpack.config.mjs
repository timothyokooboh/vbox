import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { vboxWebpackPlugin } from '@veebox/unplugin/webpack';
const root = path.dirname(fileURLToPath(import.meta.url));
export default {
  context: root,
  entry: './src/main.ts',
  output: {
    filename: '[name].[contenthash].js',
    path: path.join(root, 'dist'),
    clean: true,
    publicPath: '/',
  },
  resolve: { extensions: ['.ts', '.js', '.vue'] },
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader' },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true,
          configFile: 'tsconfig.app.json',
        },
        exclude: /node_modules/,
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.(woff2?|png|jpe?g|svg)$/i, type: 'asset/resource' },
    ],
  },
  devServer: {
    host: '127.0.0.1',
    port: 5178,
    hot: true,
    historyApiFallback: true,
    client: { logging: 'warn' },
  },
  plugins: [
    vboxWebpackPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({ template: './index.html' }),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
    }),
  ],
};
