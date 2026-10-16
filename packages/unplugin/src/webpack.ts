import { fileURLToPath } from 'node:url';
import { vboxWebpackLoader } from './webpack-loader.js';
import type {
  VBoxNativePluginOptions,
  VBoxWebpackCompiler,
  VBoxWebpackPlugin,
} from './types.js';

const loaderPath = fileURLToPath(
  new URL('./webpack-loader.js', import.meta.url),
);
const mapLoaderPath = fileURLToPath(
  new URL('./webpack-map-loader.js', import.meta.url),
);

export const vboxWebpackPlugin = (
  options: VBoxNativePluginOptions = {},
): VBoxWebpackPlugin => {
  return {
    name: 'veebox-webpack-transform',
    apply(compiler: VBoxWebpackCompiler) {
      compiler.hooks.environment.tap('veebox-webpack-transform', () => {
        const moduleConfig = compiler.options.module ?? {};
        const rules = moduleConfig.rules ?? [];

        rules.push({
          test: /\.vue$/,
          enforce: 'pre',
          use: [
            {
              loader: loaderPath,
              options,
            },
          ],
        });

        rules.push({
          test: /\.vue$/,
          enforce: 'post',
          use: [{ loader: mapLoaderPath }],
        });

        moduleConfig.rules = rules;
        compiler.options.module = moduleConfig;
      });
    },
  };
};

export { vboxWebpackLoader };
