export const stableStringify = (obj: any): string => {
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
};
