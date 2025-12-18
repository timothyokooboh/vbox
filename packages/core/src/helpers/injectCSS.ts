import { compile, serialize, stringify, middleware, prefixer } from 'stylis';

const cache = new Map<string, string>();
const cssSink = new Set<string>();

const createVendorPrefix = (css: string) => {
  if (cache.has(css)) return cache.get(css)!;

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

  const prefixedCss = createVendorPrefix(css);

  // avoid duplicate css rules in the stylesheet
  if (cssSink.has(prefixedCss)) return;

  cssSink.add(prefixedCss);

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = Array.from(cssSink).join('\n\n');
};
