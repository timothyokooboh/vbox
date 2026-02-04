import { getCss, registerCss, vendorPrefixes } from './styleRegistry';
import { createVendorPrefix as createVendorPrefixWithCache } from './vendorPrefix';

export const createVendorPrefix = (css: string) => {
  return createVendorPrefixWithCache(css, vendorPrefixes);
};

export const injectCSS = (css: string) => {
  if (typeof window === 'undefined') return;

  const id = 'vbox-style-sheet';
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;

  const prefixedCss = createVendorPrefixWithCache(css, vendorPrefixes);

  registerCss(prefixedCss);

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = getCss();
};
