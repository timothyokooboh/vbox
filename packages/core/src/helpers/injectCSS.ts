import { compile, serialize, stringify, middleware, prefixer } from 'stylis';
import { CSS_REGISTRY_KEY, VENDOR_PREFIX_KEY } from '../constants';

const vendorPrefixes: Map<string, string> =
  (globalThis as any)[VENDOR_PREFIX_KEY] ??
  ((globalThis as any)[VENDOR_PREFIX_KEY] = new Map());

const cssRegistry: Set<string> =
  (globalThis as any)[CSS_REGISTRY_KEY] ??
  ((globalThis as any)[CSS_REGISTRY_KEY] = new Set());

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

  // avoid duplicate css rules in the stylesheet
  if (cssRegistry.has(prefixedCss)) return;

  cssRegistry.add(prefixedCss);

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }

  const content = Array.from(cssRegistry);
  styleEl.textContent = content.join(`\n`);
};
