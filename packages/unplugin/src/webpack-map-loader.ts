import type { SourceMapInput } from '@jridgewell/remapping';
import { restoreWebpackMap } from './webpackMaps.js';

type LoaderContext = {
  callback: (error: Error | null, source: string, map?: SourceMapInput) => void;
};

/** Vue loader recreates its block maps; reconnect them to the authored SFC. */
export default function vboxWebpackMapLoader(
  this: LoaderContext,
  source: string,
  map?: SourceMapInput,
) {
  this.callback(null, source, restoreWebpackMap(this, map));
}
