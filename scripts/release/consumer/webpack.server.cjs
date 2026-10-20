const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const client = require('./webpack.config.cjs');
module.exports = {
  ...client,
  target: 'node',
  entry: './src/server.ts',
  output: {
    path: path.resolve('dist/server-webpack'),
    filename: 'server.cjs',
    library: { type: 'commonjs2' },
    clean: true,
  },
  externals: [/^vue$/, /^@vue\/server-renderer$/, /^@veebox\//],
  plugins: client.plugins.filter(
    (plugin) => !(plugin instanceof HtmlWebpackPlugin),
  ),
};
