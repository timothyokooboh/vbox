const cssSupportCache = new Map<string, boolean>();

export const isValidCssDeclaration = (cssProp: string, value: string) => {
  const key = `${cssProp}::${value}`;

  if (cssSupportCache.has(key)) return cssSupportCache.get(key)!;

  if (typeof window === 'undefined') return true;

  const isValid = CSS.supports(`${cssProp}: ${value}`);
  cssSupportCache.set(key, isValid);

  return isValid;
};
