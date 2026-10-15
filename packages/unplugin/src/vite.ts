import { transformVueSfc } from './transform.js';
import type { VBoxNativePluginOptions, VBoxVitePlugin } from './types.js';

export const vboxVitePlugin = (
  options: VBoxNativePluginOptions = {},
): VBoxVitePlugin => {
  return {
    name: 'veebox-vite-transform',
    enforce: 'pre',
    transform(code, id) {
      return transformVueSfc(code, id, options);
    },
  };
};
