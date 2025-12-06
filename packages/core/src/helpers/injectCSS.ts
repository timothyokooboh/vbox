import { compile, serialize, stringify, middleware, prefixer } from 'stylis';

const cache = new Map<string, string>();

const createVendoPrefix = (css: string) => {
  if (cache.has(css)) return cache.get(css);

  const prefixedCss = serialize(
    compile(css),
    middleware([prefixer, stringify]),
  );

  cache.set(css, prefixedCss);
  return prefixedCss;
};

export const injectCSS = (css: string) => {
  if (typeof window === 'undefined') return;

  const id = 'vbox-style-sheet';
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;

  if (styleEl) {
    const prefixedCss = createVendoPrefix(css);
    styleEl.textContent += prefixedCss;
    return;
  }

  styleEl = document.createElement('style');
  styleEl.id = id;
  const prefixedCss = createVendoPrefix(css);
  styleEl.textContent += prefixedCss;
  document.head.appendChild(styleEl);
};
