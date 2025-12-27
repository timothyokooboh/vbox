import { compile, serialize, stringify, middleware, prefixer } from 'stylis';
import { CSS_REGISTRY_KEY, VENDOR_PREFIX_KEY } from '../constants';

const typedGlobal = globalThis as typeof globalThis & {
  [VENDOR_PREFIX_KEY]?: Map<string, string>;
  [CSS_REGISTRY_KEY]?: Set<string>;
};

const vendorPrefixes: Map<string, string> =
  typedGlobal[VENDOR_PREFIX_KEY] ??
  (typedGlobal[VENDOR_PREFIX_KEY] = new Map());

// avoid duplicate css string in the stylesheet
const cssRegistry: Set<string> =
  typedGlobal[CSS_REGISTRY_KEY] ?? (typedGlobal[CSS_REGISTRY_KEY] = new Set());

export const createVendorPrefix = (css: string) => {
  if (vendorPrefixes.has(css)) return vendorPrefixes.get(css)!;

  const prefixedCss = serialize(
    compile(css),
    middleware([prefixer, stringify]),
  );

  vendorPrefixes.set(css, prefixedCss);
  return prefixedCss;
};

export const injectCSS = (css: string) => {
  if (typeof window === 'undefined') return;

  const id = 'vbox-style-sheet';
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;

  const prefixedCss = createVendorPrefix(css);

  cssRegistry.add(prefixedCss);

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }

  const content = Array.from(cssRegistry);
  styleEl.textContent = content.join(`\n`);
};
