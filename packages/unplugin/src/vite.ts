import { transformVueSfc } from './transform.js';
import type { VBoxNativePluginOptions, VBoxVitePlugin } from './types.js';

export const vboxVitePlugin = (
  options: VBoxNativePluginOptions = {},
): VBoxVitePlugin => {
  return {
    name: 'veebox-vite-transform',
    enforce: 'pre',
    transform(code, id) {
      const result = transformVueSfc(code, id, options);
      for (const warning of result?.warnings ?? []) {
        (this as { warn?: (message: string) => void }).warn?.(warning.message);
      }
      return result;
    },
  };
};
