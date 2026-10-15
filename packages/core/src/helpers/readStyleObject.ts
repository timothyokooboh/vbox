import { isConditionKey } from './resolveConfig.js';
import { getStyleBindingKey } from './styleBindingName.js';
import { toKebabCase } from './toKebabCase.js';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value === 'object' &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);

/** Validate explicit style sources before values can become object-to-string CSS. */
export const readStyleObject = (
  input: unknown,
  source: 'grouped' | 'individual' = 'grouped',
) => {
  const ancestors = new Set<object>();
  const read = (
    value: unknown,
    location: string,
    selectors = false,
    onlySelectors = false,
  ): Record<string, unknown> => {
    if (value == null) return {};
    if (!isPlainObject(value))
      throw new TypeError(
        `[VBox] ${location} expects a plain style object (or null/undefined), not a scalar or array.`,
      );
    if (ancestors.has(value))
      throw new TypeError(`[VBox] Circular style object at ${location}.`);
    ancestors.add(value);
    const result: Array<[string, unknown]> = [];
    for (const [key, entry] of Object.entries(value)) {
      if (entry == null) continue;
      const at = `${location}.${key}`;
      if (
        source === 'grouped' &&
        !onlySelectors &&
        getStyleBindingKey(key) !== null
      )
        throw new TypeError(
          `[VBox] ${at}: use unprefixed style keys inside :vb objects.`,
        );
      if (onlySelectors || isConditionKey(key)) {
        const name = toKebabCase(key);
        result.push([
          key,
          read(entry, at, true, ['mq', 'cq', 'pseudos'].includes(name)),
        ]);
      } else if (typeof entry === 'string' || typeof entry === 'number') {
        result.push([key, entry]);
      } else if (selectors && isPlainObject(entry)) {
        result.push([key, read(entry, at, true)]);
      } else {
        throw new TypeError(
          `[VBox] ${at} expects a scalar string/number or a known condition-group object.`,
        );
      }
    }
    ancestors.delete(value);
    return Object.fromEntries(result);
  };
  return read(input, source === 'grouped' ? ':vb' : 'vb-*');
};
