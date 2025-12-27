export const kebabToCamelCase = (str: string) =>
  str.replace(
    /([A-Za-z])-([a-z])/g,
    (_, prev, char) => prev + char.toUpperCase(),
  );
