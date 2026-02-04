import { compile, serialize, stringify, middleware, prefixer } from 'stylis';

export const createVendorPrefix = (
  css: string,
  cache: Map<string, string>,
) => {
  if (cache.has(css)) return cache.get(css)!;

  const prefixedCss = serialize(
    compile(css),
    middleware([prefixer, stringify]),
  );

  cache.set(css, prefixedCss);
  return prefixedCss;
};
