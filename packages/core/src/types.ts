import type {
  StandardProperties,
  VendorPropertiesHyphen,
  Pseudos,
} from 'csstype';
import { type DefaultAliases } from './constants';

export type CSSCustomProperties = { [index: `--${string}`]: unknown };
export type CssProperties = StandardProperties &
  VendorPropertiesHyphen &
  CSSCustomProperties;

// filled by cli through npx vbox-type-gen
export interface ColorTokensInterface {}
export interface FontSizeTokensInterface {}
export interface FontWeightTokensInterface {}
export interface FontFamilyTokensInterface {}
export interface SpacingTokensInterface {}
export interface LineHeightTokensInterface {}
export interface LetterSpacingTokensInterface {}
export interface BorderRadiusTokensInterface {}
export interface BoxShadowTokensInterface {}
export interface ZIndexTokensInterface {}

export type ColorTokens =
  | `cl-${keyof ColorTokensInterface}`
  | `var(--color-${keyof ColorTokensInterface})`;

export type FontSizeTokens =
  | `fs-${keyof FontSizeTokensInterface}`
  | `var(--font-size-${keyof FontSizeTokensInterface})`;

export type FontWeightTokens =
  | `fw-${keyof FontWeightTokensInterface}`
  | `var(--font-weight-${keyof FontWeightTokensInterface})`;

export type FontFamilyTokens =
  | `ff-${keyof FontFamilyTokensInterface}`
  | `var(--font-family-${keyof FontFamilyTokensInterface})`;

export type SpacingTokens =
  | `sp-${keyof SpacingTokensInterface}`
  | `var(--spacing-${keyof SpacingTokensInterface})`;

export type LetterSpacingTokens =
  | `ls-${keyof LetterSpacingTokensInterface}`
  | `var(--letter-spacing-${keyof LetterSpacingTokensInterface})`;

export type LineHeightTokens =
  | `lh-${keyof LineHeightTokensInterface}`
  | `var(--line-height-${keyof LineHeightTokensInterface})`;

export type BorderRadiusTokens =
  | `br-${keyof BorderRadiusTokensInterface}`
  | `var(--border-radius-${keyof BorderRadiusTokensInterface})`;

export type BoxShadowTokens =
  | `bs-${keyof BoxShadowTokensInterface}`
  | `var(--box-shadow-${keyof BoxShadowTokensInterface})`;

export type ZIndexTokens =
  | `z-${keyof ZIndexTokensInterface}`
  | `var(--z-index-${keyof ZIndexTokensInterface})`;

export type DesignTokens =
  | ColorTokens
  | FontSizeTokens
  | FontWeightTokens
  | FontFamilyTokens
  | SpacingTokens
  | LineHeightTokens
  | LetterSpacingTokens
  | BorderRadiusTokens
  | ZIndexTokens
  | BoxShadowTokens;

// Augment CSS properties to also use design tokens as values
export type AugmentedCSSProperties = {
  [K in keyof CssProperties]?: CssProperties[K] | DesignTokens;
};

/**
 * CSS selector blocks keyed by selector strings.
 * Keys may include `&` for parent reference.
 * Example: `{ '&:first-child': { color: 'red' } }`
 */
export type Selectors = Record<string, AugmentedCSSProperties>;

/**
 * Alias-based CSS props derived from `AliasMap`.
 * Example: `d="flex"` → `display: flex`.
 */
export type AliasProps = {
  [K in keyof AliasMap]?: CssProperties[AliasMap[K]] | DesignTokens;
};

/**
 * A union type representing either plain CSS properties
 * or nested selector rules.
 */
export type PropertiesAndSelectors =
  | AugmentedCSSProperties
  | Selectors
  | AliasProps;

/**
 * Maps shorthand keys to full CSS property names.
 * Used internally to expand alias props at runtime.
 * Example: `{ m: 'margin', p: 'padding' }`
 */
type DefaultAliasesType = typeof DefaultAliases;
export interface AliasMap extends DefaultAliasesType {}

/**
 * Shorthand props for common pseudo-classes such as :hover and :focus.
 * Each key maps to a style object applied under that pseudo-class.
 */
export interface CommonPseudoProps {
  hover?: PropertiesAndSelectors;
  focus?: PropertiesAndSelectors;
  focusVisible?: PropertiesAndSelectors;
  focusWithin?: PropertiesAndSelectors;
  active?: PropertiesAndSelectors;
  _disabled?: PropertiesAndSelectors;
}

/**
 * Styles for any CSS pseudo-class or pseudo-element.
 * Allows defining pseudo styles not covered by `CommonPseudoProps`.
 */
export type PseudoProps = {
  pseudos?: {
    [P in Pseudos]?: PropertiesAndSelectors;
  };
};

/**
 * Responsive styles for predefined breakpoints: sm, md, lg, xl and 2xl
 * Each field accepts CSS properties or selectors.
 */
export interface BreakpointProps {
  sm?: PropertiesAndSelectors;
  md?: PropertiesAndSelectors;
  lg?: PropertiesAndSelectors;
  xl?: PropertiesAndSelectors;
  // "2xl"?: PropertiesAndSelectors;
}

export type Breakpoints = Required<{
  [K in keyof BreakpointProps]: string;
}>;

/**
 * All CSS properties accept the native StandardCssProperties value
 * OR any design token var (CSSTokenAndVars)
 */
/*
export type CSSStyleProps = AugmentedCSSProperties & {
  [K in keyof AliasProps]?: AliasProps[K] | DesignTokens;
}*/
export type CSSStyleProps = AugmentedCSSProperties & AliasProps;

export type VBoxProps = PseudoProps &
  CommonPseudoProps &
  BreakpointProps &
  /** @vue-ignore */ CSSStyleProps & {
    /** Polymorphic HTML tag to render, e.g. 'div', 'button', 'a'. */
    is?: keyof HTMLElementTagNameMap;

    /** Media query styles keyed by a full `@media ...` query string. */
    mq?: Record<`@media ${string}`, PropertiesAndSelectors>;

    /** Container query styles keyed by a full `@container ...` query string. */
    cq?: Record<`@container ${string}`, PropertiesAndSelectors>;

    /**
     * Supports CSS properties and selectors,
     */
    declarations?: PropertiesAndSelectors;
    /**
     * Styles applied when the `.dark` class is present on the root element.
     * Mirrors Tailwind-style dark-mode behavior.
     */
    dark?: PropertiesAndSelectors;
    /**
     * When true, renders only the single child element and applies all styles to it.
     * Similar to the `asChild` pattern in Radix UI. Requires exactly one child.
     */
    asChild?: boolean;
  };

export type VBoxStyleProps = Omit<VBoxProps, 'is'>;

export type AliasStrategy = 'merge' | 'replace';
export interface VBoxPluginOptions {
  classNamePrefix?: string;
  enableDefaultTheme?: boolean;
  cssResets?: boolean;
  breakpoints?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  aliases?: {
    strategy?: AliasStrategy;
    values: Record<string, keyof CSSStyleDeclaration>;
  };
  theme?: {
    color?: Record<string, string | Record<string, string>>;
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, string>;
    fontFamily?: Record<string, string>;
    lineHeight?: Record<string, string>;
    letterSpacing?: Record<string, string>;
    spacing?: Record<string, string>;
    borderRadius?: Record<string, string>;
    boxShadow?: Record<string, string>;
    zIndex?: Record<string, string>;
  };
}

export type Theme = Required<VBoxPluginOptions>['theme'];
export type ThemeKeys = keyof Theme;
