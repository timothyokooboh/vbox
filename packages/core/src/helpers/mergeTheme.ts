import { isObjectLiteral } from './isObjectLiteral.js';

/**
 * Deep merges `base` and `override`.
 * `override` wins. Arrays are replaced (not merged).
 */
export const deepMerge = (
  base: Record<string, any>,
  override?: Record<string, any>,
) => {
  if (!override) return { ...base };

  const out: Record<string, any> = { ...base };

  for (const key of Object.keys(override)) {
    const baseVal = (base as any)[key];
    const overrideVal = (override as any)[key];

    if (isObjectLiteral(baseVal) && isObjectLiteral(overrideVal)) {
      out[key] = deepMerge(baseVal, overrideVal);
    } else {
      out[key] = overrideVal;
    }
  }

  return out;
};
