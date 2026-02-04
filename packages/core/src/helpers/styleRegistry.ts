import {
  CSS_REGISTRY_KEY,
  CSS_REGISTRY_LISTENERS_KEY,
  VENDOR_PREFIX_KEY,
} from '../constants';
import { createVendorPrefix } from './vendorPrefix';

const typedGlobal = globalThis as typeof globalThis & {
  [VENDOR_PREFIX_KEY]?: Map<string, string>;
  [CSS_REGISTRY_KEY]?: Set<string>;
  [CSS_REGISTRY_LISTENERS_KEY]?: Set<() => void>;
};

export const vendorPrefixes: Map<string, string> =
  typedGlobal[VENDOR_PREFIX_KEY] ??
  (typedGlobal[VENDOR_PREFIX_KEY] = new Map());

export const cssRegistry =
  typedGlobal[CSS_REGISTRY_KEY] ?? (typedGlobal[CSS_REGISTRY_KEY] = new Set());

export const registerCss = (css: string, registry: Set<string> = cssRegistry) => {
  if (registry.has(css)) {
    registry.delete(css);
  }

  // maintain css cascade
  registry.add(css);
};

export const getCss = (registry: Set<string> = cssRegistry) => {
  return Array.from(registry).join('\n\n');
};

export type StyleCollector = {
  collect: (css: string) => void;
  getCss: () => string;
  reset: () => void;
};

export const createStyleCollector = (): StyleCollector => {
  const registry = new Set<string>();
  const prefixCache = new Map<string, string>();

  return {
    collect(css: string) {
      const prefixed = createVendorPrefix(css, prefixCache);
      registerCss(prefixed, registry);
    },
    getCss() {
      return getCss(registry);
    },
    reset() {
      registry.clear();
      prefixCache.clear();
    },
  };
};
