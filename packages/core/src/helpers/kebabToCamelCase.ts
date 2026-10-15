export const kebabToCamelCase = (str: string) => {
  if (str.startsWith('--')) return str;

  return str.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
};
