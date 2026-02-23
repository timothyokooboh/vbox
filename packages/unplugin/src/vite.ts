import { transformVueSfc } from './transform.js';
import type { VBoxNativePluginOptions, VBoxVitePlugin } from './types.js';

export const vboxNativePlugin = (
  options: VBoxNativePluginOptions = {},
): VBoxVitePlugin => {
  return {
    name: 'veebox-native-vbox-transform',
    enforce: 'pre',
    transform(code, id) {
      return transformVueSfc(code, id, options);
    },
  };
};
