import { DefaultAliases, ObjectStyleKeys } from '../constants.js';
import { toKebabCase } from './toKebabCase.js';

/** Tooling vocabulary only: recognition must never decide whether a binding is styling. */
export const createStyleVocabulary = (
  cssProperties: Iterable<string>,
  aliases: Iterable<string> = Object.keys(DefaultAliases),
) => {
  const properties = new Set(
    [...cssProperties, ...aliases].map((key) => toKebabCase(key)),
  );
  const groups = new Set(
    ObjectStyleKeys.map((key) => toKebabCase(key).replace(/^_/, '')),
  );
  return (key: string) =>
    key.startsWith('--') ||
    properties.has(toKebabCase(key)) ||
    groups.has(toKebabCase(key).replace(/^_/, ''));
};
