import {
  DefaultAliases,
  DefaultBreakpoints,
  DefaultTheme,
  ObjectStyleKeys,
} from '../constants.js';
import type { AliasMap, Breakpoints, VBoxPluginOptions } from '../types.js';
import { kebabToCamelCase } from './kebabToCamelCase.js';
import { toKebabCase } from './toKebabCase.js';
import { deepMerge } from './mergeTheme.js';
import { normalizeTheme, buildCSSVariables } from './themeConfigParser.js';

export const isConditionKey = (key: string) => {
  const normalized = toKebabCase(key).replace(/^_/, '');
  return ObjectStyleKeys.some(
    (candidate) => toKebabCase(candidate).replace(/^_/, '') === normalized,
  );
};

export const validateAliasKeys = (
  keys: string[],
  source = 'vbox.config aliases.values',
) => {
  for (const key of keys) {
    if (isConditionKey(key))
      throw new Error(
        `[VBox] ${source}: alias "${key}" conflicts with a reserved condition group.`,
      );
  }
};

/** Effective vocabulary shared by runtime, type generation and editor tooling. */
export const resolveVBoxConfig = (options: VBoxPluginOptions = {}) => {
  const custom = options.aliases?.values ?? {};
  validateAliasKeys(Object.keys(custom));
  const aliases = Object.fromEntries(
    Object.entries({
      ...(options.aliases?.strategy === 'replace' ? {} : DefaultAliases),
      ...custom,
    }).map(([key, value]) => [kebabToCamelCase(key), value]),
  ) as AliasMap;
  const theme = deepMerge(
    options.enableDefaultTheme === false ? {} : DefaultTheme,
    options.theme,
  );
  const tokens = normalizeTheme(theme);
  return {
    aliases,
    theme,
    ...tokens,
    themeCss: buildCSSVariables(tokens),
    breakpoints: Object.fromEntries(
      Object.entries(DefaultBreakpoints).map(([key, value]) => [
        key,
        options.breakpoints?.[key as keyof Breakpoints] ?? value,
      ]),
    ) as Breakpoints,
    classNamePrefix: options.classNamePrefix ?? '',
  };
};
