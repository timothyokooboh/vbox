import type { VBoxPluginOptions } from './types';

export { isValidCssDeclaration } from './helpers/isValidCssDeclaration';
export { isValidCssSelector } from './helpers/isValidCssSelector';
export { parseStyleObject } from './helpers/parseStyleObject';
export { buildCssString } from './helpers/buildCssString';
export { injectCSS } from './helpers/injectCSS';
export { deepMerge } from './helpers/mergeTheme';
export { createDjb2Hash } from './helpers/createDjb2Hash';
export { stableStringify } from './helpers/stableStringify';
export {
  normalizeTheme,
  resolveToken,
  buildCSSVariables,
} from './helpers/themeConfigParser';
export { getCss } from './helpers/styleRegistry';
export { keyframes } from './helpers/keyframes';
export { __DEV__ } from './helpers/isDevelopment';
export { DefaultAliases, DefaultBreakpoints, DefaultTheme } from './constants';
export type {
  VBoxProps,
  VBoxStyleProps,
  VBoxPluginOptions,
  AliasStrategy,
  Breakpoints,
  AliasMap,
  PropertiesAndSelectors,
  Selectors,
  CommonPseudoProps,
  PseudoProps,
  AliasProps,
  ColorTokensInterface,
  FontSizeTokensInterface,
  FontWeightTokensInterface,
  LineHeightTokensInterface,
  LetterSpacingTokensInterface,
  FontFamilyTokensInterface,
  SpacingTokensInterface,
  BorderRadiusTokensInterface,
  BoxShadowTokensInterface,
  ZIndexTokensInterface,
  BreakpointProps,
  CssProperties,
} from './types';

export function defineConfig(config: VBoxPluginOptions) {
  return config;
}
