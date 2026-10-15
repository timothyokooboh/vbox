import { transformVueSfc } from './transform.js';
import type { VBoxNativePluginOptions } from './types.js';

type WebpackLoaderContext = {
  resourcePath?: string;
  getOptions?: () => VBoxNativePluginOptions;
};

export const vboxWebpackLoader = function vboxWebpackLoader(
  this: WebpackLoaderContext,
  source: string,
) {
  const id = this.resourcePath ?? '';
  const options = this.getOptions?.() ?? {};
  const out = transformVueSfc(source, id, options);
  return out?.code ?? source;
};

export default vboxWebpackLoader;
