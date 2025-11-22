/**
 * Converts a style object into a CSS declaration string.
 *
 * @example
 * buildRules({ color: "red", "font-size": "1rem" })
 * // "color: red; font-size: 1rem;"
 */
export const buildRules = (styles: Record<string, string>) => {
  return Object.entries(styles)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");
};
