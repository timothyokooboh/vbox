import { toKebabCase } from './toKebabCase';

/** Return only explicit static style names; ordinary Vue bindings stay semantic. */
export const getStyleBindingKey = (name: string): string | null => {
  if (name.startsWith('vb-')) return toKebabCase(name.slice(3));
  if (/^vb[A-Z]/.test(name)) {
    const suffix = name.slice(2);
    return toKebabCase(suffix[0].toLowerCase() + suffix.slice(1));
  }
  return null;
};
