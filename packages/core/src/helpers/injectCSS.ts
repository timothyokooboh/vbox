import {
  getCss,
  registerCss,
  registerStyleBundle,
  type CssPriority,
  vendorPrefixes,
} from './styleRegistry';
import type { StyleBundle } from '../styles/types';
import { createVendorPrefix as createVendorPrefixWithCache } from './vendorPrefix';

export const createVendorPrefix = (css: string) => {
  return createVendorPrefixWithCache(css, vendorPrefixes);
};

const updateStyleElement = () => {
  const id = 'vbox-style-sheet';
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = getCss();
};

export const injectCSS = (css: string, priority: CssPriority = 'base') => {
  if (typeof window === 'undefined') return;
  registerCss(
    createVendorPrefixWithCache(css, vendorPrefixes),
    undefined,
    priority,
  );
  updateStyleElement();
};

export const injectStyleBundle = (bundle: StyleBundle) => {
  if (typeof window === 'undefined') return;
  registerStyleBundle(bundle);
  updateStyleElement();
};
