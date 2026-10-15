import { vboxWebpackLoader } from './webpack-loader.js';
import type {
  VBoxNativePluginOptions,
  VBoxWebpackCompiler,
  VBoxWebpackPlugin,
} from './types.js';

const loaderPath = new URL('./webpack-loader.js', import.meta.url).pathname;

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

        moduleConfig.rules = rules;
        compiler.options.module = moduleConfig;
      });
    },
  };
};

export { vboxWebpackLoader };
