import type { VBoxPluginOptions } from '../types.js';
import { isObjectLiteral } from './isObjectLiteral.js';

/**
 * Deep merges `base` and `override`.
 * `override` wins.
 */
export const deepMerge = (
  base: VBoxPluginOptions['theme'] = {},
  override?: VBoxPluginOptions['theme'],
) => {
  if (!override) return { ...base };

  const output: Record<string, any> = { ...base };

  for (const key of Object.keys(override)) {
    const baseVal = base[key as keyof VBoxPluginOptions['theme']];
    const overrideVal = override[key as keyof VBoxPluginOptions['theme']];

    if (isObjectLiteral(baseVal) && isObjectLiteral(overrideVal)) {
      output[key] = deepMerge(baseVal, overrideVal);
    } else {
      output[key] = overrideVal;
    }
  }

  return output;
};
