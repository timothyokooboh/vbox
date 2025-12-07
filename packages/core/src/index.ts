import type { VBoxPluginOptions } from './types';

export { isValidCssDeclaration } from './helpers/isValidCssDeclaration';
export { isValidCssSelector } from './helpers/isValidCssSelector';
export { parseStyleObject } from './helpers/parseStyleObject';
export { buildCssString } from './helpers/buildCssString';
export { injectCSS } from './helpers/injectCSS';
export { deepMerge } from './helpers/mergeTheme';
export {
  normalizeTheme,
  resolveToken,
  buildCSSVariables,
} from './helpers/themeConfigParser';
export { keyframes } from './helpers/keyframes';
export {
  DefaultAliases,
  DefaultBreakpoints,
  DefaultDesignSystem,
} from './constants';
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
  ZIndexTokensInterface,
  BreakpointProps,
  CssProperties,
} from './types';

export function defineConfig(config: VBoxPluginOptions) {
  return config;
}
