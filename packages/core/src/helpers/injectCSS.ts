import { compile, serialize, stringify, middleware, prefixer } from 'stylis';
import { getCss, registerCss, vendorPrefixes } from './styleRegistry';

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

  registerCss(prefixedCss);

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = getCss();
};
