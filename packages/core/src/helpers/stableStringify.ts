export const stableStringify = (obj: object): string => {
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
};
