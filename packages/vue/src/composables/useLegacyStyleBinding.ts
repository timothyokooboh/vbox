import { inject } from 'vue';
import { all } from 'known-css-properties';
import {
  DefaultAliases,
  isConditionKey,
  kebabToCamelCase,
  toKebabCase,
} from '@veebox/core';
import { aliasKey } from '../injectionSymbols';
import { useVBoxStyleBinding } from './useVBoxStyleBinding';

const cssProperties = new Set(all);

/** Only the published polymorphic boundary interprets unprefixed style props. */
export const useLegacyStyleBinding = () => {
  const bind = useVBoxStyleBinding();
  const aliases = inject(aliasKey, DefaultAliases);
  return (values: Record<string, unknown>) => {
    const styles: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(values)) {
      if (value == null) continue;
      const normalized = kebabToCamelCase(key);
      if (isConditionKey(key)) {
        // Native disabled remains a boolean; the compatibility state is an object.
        if (typeof value === 'object') styles[key] = value;
      } else if (
        (typeof value === 'string' || typeof value === 'number') &&
        (key.startsWith('--') ||
          Object.hasOwn(aliases, normalized) ||
          cssProperties.has(toKebabCase(key)))
      ) {
        styles[key] = value;
      }
    }
    return bind(styles);
  };
};
