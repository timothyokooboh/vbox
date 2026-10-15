export const toKebabCase = (str: string): string => {
  if (str.startsWith('--')) return str;
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/^(webkit|moz|ms|o)-/, '-$1-');
};
