export const isObjectLiteral = (value: unknown) =>
  Object.prototype.toString.call(value) === '[object Object]';
