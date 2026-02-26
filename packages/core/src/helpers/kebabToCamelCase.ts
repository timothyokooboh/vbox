export const kebabToCamelCase = (str: string) => {
  if (str.startsWith('--')) {
    return `--${str
      .slice(2)
      .replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())}`;
  }

  return str.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
};
