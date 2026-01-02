import {
  CSS_REGISTRY_KEY,
  CSS_REGISTRY_LISTENERS_KEY,
  VENDOR_PREFIX_KEY,
} from '../constants';

const typedGlobal = globalThis as typeof globalThis & {
  [VENDOR_PREFIX_KEY]?: Map<string, string>;
  [CSS_REGISTRY_KEY]?: Set<string>;
  [CSS_REGISTRY_LISTENERS_KEY]?: Set<() => void>;
};

export const vendorPrefixes: Map<string, string> =
  typedGlobal[VENDOR_PREFIX_KEY] ??
  (typedGlobal[VENDOR_PREFIX_KEY] = new Map());

// avoid duplicate css string in the stylesheet
export const cssRegistry =
  typedGlobal[CSS_REGISTRY_KEY] ?? (typedGlobal[CSS_REGISTRY_KEY] = new Set());

export const registerCss = (css: string) => {
  if (cssRegistry.has(css)) return;

  cssRegistry.add(css);
};

export const getCss = () => {
  return Array.from(cssRegistry).join('\n\n');
};
