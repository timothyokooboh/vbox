import type { VBoxPluginOptions } from "./types";

export { isValidCssDeclaration } from "./helpers/isValidCssDeclaration";
export { isValidCssSelector } from "./helpers/isValidCssSelector";
export { parseStyleObject } from "./helpers/parseStyleObject";
export { buildCssString } from "./helpers/buildCssString";
export { injectCSS } from "./helpers/injectCSS";
export {
  normalizeTheme,
  resolveToken,
  buildCSSVariables,
} from "./helpers/themeConfigParser";
export { DefaultAliases, DefaultBreakpoints } from "./constants";
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
  FontFamilyTokensInterface,
  SpacingTokensInterface,
  CSSStyleProps,
  BreakpointProps,
  StandardCssProperties,
} from "./types";

export function defineConfig(config: VBoxPluginOptions) {
  return config;
}
