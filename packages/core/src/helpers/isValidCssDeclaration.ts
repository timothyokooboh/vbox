const cssSupportCache = new Map<string, boolean>();

export const isValidCssDeclaration = (cssProp: string, value: string) => {
  const trimmedValue = value.trim();
  const trimmedProperty = cssProp.trim();
  const key = `${trimmedProperty}::${trimmedValue}`;

  if (cssSupportCache.has(key)) return cssSupportCache.get(key)!;

  const isValid = CSS.supports(`${trimmedProperty}: ${trimmedValue}`);
  cssSupportCache.set(key, isValid);

  return isValid;
};
