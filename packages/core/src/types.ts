import type { StandardProperties, Pseudos } from "csstype";
import { type DefaultAliases } from "./constants";

export type CSSCustomProperties = { [index: `--${string}`]: unknown };
export type StandardCssProperties = StandardProperties & CSSCustomProperties;

/**
 * Maps shorthand keys to full CSS property names.
 * Used internally to expand alias props at runtime.
 * Example: `{ d: 'display', p: 'padding' }`
 */
type DefaultAliasesType = typeof DefaultAliases;
export interface AliasMap extends DefaultAliasesType {}

/**
 * CSS selector blocks keyed by selector strings.
 * Keys may include `&` for parent reference.
 * Example: `{ '&:first-child': { color: 'red' } }`
 */
export type Selectors = Record<string, StandardCssProperties>;

/**
 * A union type representing either plain CSS properties
 * or nested selector rules.
 */
export type PropertiesAndSelectors = StandardCssProperties | Selectors;

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

// filled by cli through npx vbox-type-gen
export interface ColorTokensInterface {}
export interface FontSizeTokensInterface {}
export interface FontWeightTokensInterface {}
export interface FontFamilyTokensInterface {}
export interface SpacingTokensInterface {}

export type ColorVar = `var(--color-${keyof ColorTokensInterface})`;

export type FontSizeVar = `var(--font-size-${keyof FontSizeTokensInterface})`;

export type FontWeightVar =
  `var(--font-weight-${keyof FontWeightTokensInterface})`;

export type FontFamilyVar =
  `var(--font-family-${keyof FontFamilyTokensInterface})`;

export type SpacingVar = `var(--spacing-${keyof SpacingTokensInterface})`;

export type CSSVar =
  | ColorVar
  | FontSizeVar
  | FontWeightVar
  | FontFamilyVar
  | SpacingVar;

/**
 * Alias-based CSS props derived from `AliasMap`.
 * Example: `d="flex"` → `display: flex`.
 */
export type AliasProps = {
  [K in keyof AliasMap]?: StandardCssProperties[AliasMap[K]] | CSSVar;
};

/**
 * All CSS properties accept the native StandardCssProperties value
 * OR any design token var (CSSVar)
 */
export type CSSStyleProps = {
  [K in keyof StandardCssProperties]?: StandardCssProperties[K] | CSSVar;
} & {
  [K in keyof AliasProps]?: AliasProps[K] | CSSVar;
};

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
     * Escape hatch for complex styles not covered by other props.
     * Supports CSS properties, selectors, media queries, and container queries.
     */
    css?: PropertiesAndSelectors & VBoxProps["mq"] & VBoxProps["cq"];
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

export type VBoxStyleProps = Omit<VBoxProps, "is">;

export type AliasStrategy = "merge" | "replace";
export interface VBoxPluginOptions {
  classNamePrefix?: string;
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
    spacing?: Record<string, string>;
  };
}
