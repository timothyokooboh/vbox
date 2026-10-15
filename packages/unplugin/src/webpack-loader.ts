import { transformVueSfc } from './transform.js';
import type { VBoxNativePluginOptions } from './types.js';

type WebpackLoaderContext = {
  resourcePath?: string;
  addDependency?: (file: string) => void;
  emitWarning?: (error: Error) => void;
  callback?: (error: Error | null, source: string, map?: unknown) => void;
  getOptions?: () => VBoxNativePluginOptions;
};

export const vboxWebpackLoader = function vboxWebpackLoader(
  this: WebpackLoaderContext,
  source: string,
) {
  const id = this.resourcePath ?? '';
  const options = this.getOptions?.() ?? {};
  const out = transformVueSfc(source, id, options);
  for (const file of out?.dependencies ?? []) this.addDependency?.(file);
  for (const warning of out?.warnings ?? [])
    this.emitWarning?.(new Error(warning.message));
  if (this.callback && out?.map) {
    this.callback(null, out.code, JSON.parse(out.map.toString()));
    return;
  }
  return out?.code ?? source;
};

export default vboxWebpackLoader;
