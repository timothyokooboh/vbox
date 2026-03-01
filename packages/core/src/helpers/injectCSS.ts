import {
  getCss,
  registerCss,
  type CssPriority,
  vendorPrefixes,
} from './styleRegistry';
import { createVendorPrefix as createVendorPrefixWithCache } from './vendorPrefix';

export const createVendorPrefix = (css: string) => {
  return createVendorPrefixWithCache(css, vendorPrefixes);
};

export const injectCSS = (css: string, priority: CssPriority = 'base') => {
  if (typeof window === 'undefined') return;

  const id = 'vbox-style-sheet';
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;

  const prefixedCss = createVendorPrefixWithCache(css, vendorPrefixes);

  registerCss(prefixedCss, undefined, priority);

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = getCss();
};
