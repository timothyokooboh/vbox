export const kebabToCamelCase = (str: string) =>
  str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
