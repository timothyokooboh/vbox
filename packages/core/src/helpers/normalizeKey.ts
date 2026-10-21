import type { AliasMap } from '../types';
import { kebabToCamelCase } from './kebabToCamelCase';

/** Resolve against the current consumer, never a process-global key-only cache. */
export const normalizeKey = (key: string, aliases: AliasMap): string => {
  if (key.startsWith('--')) return key;
  const camelCaseKey = kebabToCamelCase(key);
  for (const name of [key, camelCaseKey]) {
    if (Object.hasOwn(aliases, name))
      return aliases[name as keyof AliasMap] ?? camelCaseKey;
  }
  return camelCaseKey;
};
