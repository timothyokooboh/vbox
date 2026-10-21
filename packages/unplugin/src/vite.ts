import { transformVueSfc } from './transform.js';
import type { VBoxNativePluginOptions, VBoxVitePlugin } from './types.js';

export const vboxVitePlugin = (
  options: VBoxNativePluginOptions = {},
): VBoxVitePlugin => {
  const watched = new Set<string>();
  return {
    name: 'veebox-vite-transform',
    enforce: 'pre',
    handleHotUpdate({ file, server }) {
      if (!watched.has(file)) return;
      server.moduleGraph.invalidateAll();
      server.ws.send({ type: 'full-reload' });
      return [];
    },
    transform(code, id) {
      const result = transformVueSfc(code, id, options);
      for (const file of result?.dependencies ?? []) {
        watched.add(file);
        (this as { addWatchFile?: (file: string) => void }).addWatchFile?.(
          file,
        );
      }
      for (const warning of result?.warnings ?? []) {
        (this as { warn?: (message: string) => void }).warn?.(warning.message);
      }
      return result;
    },
  };
};
