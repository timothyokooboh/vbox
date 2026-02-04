export const isValidCssSelector = (selector: string): boolean => {
  if (typeof document === 'undefined') return true;

  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    return false;
  }
};
