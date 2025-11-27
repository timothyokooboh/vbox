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
 * Responsive styles for predefined breakpoints: sm, md, lg, xl.
 * Each field accepts CSS properties or selectors.
 */

export interface BreakpointProps {
  sm?: PropertiesAndSelectors;
  md?: PropertiesAndSelectors;
  lg?: PropertiesAndSelectors;
  xl?: PropertiesAndSelectors;
}

/**
 * Alias-based CSS props derived from `AliasMap`.
 * Example: `d="flex"` → `display: flex`.
 */
export type AliasProps = {
  [K in keyof AliasMap]?: StandardCssProperties[AliasMap[K]];
};

export interface ColorTokensInterface {}
type ColorTokens = keyof ColorTokensInterface;
type ColorVars = `var(--colors-${ColorTokens})`;
type ColorTokensAndVars = ColorTokens | ColorVars;
export type ColorPropertyKeys =
  | "color"
  | "background"
  | "backgroundColor"
  | "borderColor"
  | "outlineColor"
  | "caretColor"
  | "textDecorationColor"
  | "fill"
  | "stroke"
  | "bgColor"
  | "bg";

export interface FontSizeTokensInterface {}
type FontSizeTokens = keyof FontSizeTokensInterface;
type FontSizeVars = `var(--font-size-${FontSizeTokens})`;
type FontSizeTokensAndVars = FontSizeTokens | FontSizeVars;
type FontSizePropertyKeys = "fontSize" | "fs";

export interface FontWeightTokensInterface {}
type FontWeightTokens = keyof FontWeightTokensInterface;
type FontWeightVars = `var(--font-weight-${FontWeightTokens})`;
type FontWeightTokensAndVars = FontWeightTokens | FontWeightVars;
type FontWeightPropertyKeys = "fontWeight" | "fw";

export interface FontFamilyTokensInterface {}
type FontFamilyTokens = keyof FontFamilyTokensInterface;
type FontFamilyVars = `var(--font-family-${FontFamilyTokens})`;
type FontFamilyTokensAndVars = FontFamilyTokens | FontFamilyVars;
type FontFamilyPropertyKeys = "fontFamily" | "ff";

export interface SpacingTokensInterface {}
type SpacingTokens = keyof SpacingTokensInterface;
type SpacingVars = `var(--font-family-${SpacingTokens})`;
type SpacingTokensAndVars = SpacingTokens | SpacingVars;
type SpacingPropertyKeys =
  | "margin"
  | "marginTop"
  | "marginBlockStart"
  | "marginBottom"
  | "marginBlockEnd"
  | "marginBlock"
  | "marginRight"
  | "marginInlineEnd"
  | "marginLeft"
  | "marginInlineStart"
  | "marginInline"
  | "padding"
  | "paddingTop"
  | "paddingBlockStart"
  | "paddingBottom"
  | "paddingBlockEnd"
  | "paddingBlock"
  | "paddingRight"
  | "paddingInlineEnd"
  | "paddingLeft"
  | "paddingInlineStart"
  | "paddingInline"
  | "gap"
  | "columnGap"
  | "rowGap"
  | "lineHeight"
  | "letterSpacing"
  | "borderSpacing"
  | "wordSpacing"
  | "textIndent"
  | "ff"
  | "lh"
  | "ls"
  | "m"
  | "mt"
  | "mb"
  | "my"
  | "mr"
  | "ml"
  | "mx"
  | "p"
  | "pt"
  | "pb"
  | "py"
  | "pr"
  | "pl"
  | "px";

/**
 * Direct CSS properties supported by `csstype`, plus any defined aliases.
 *
 * Allows v-box to accept CSS properties and aliases as props.
 */
export type CSSStyleProps = {
  [K in keyof StandardCssProperties]?: K extends ColorPropertyKeys
    ? StandardCssProperties[K] | ColorTokensAndVars
    : K extends FontSizePropertyKeys
      ? StandardCssProperties[K] | FontSizeTokensAndVars
      : K extends FontWeightPropertyKeys
        ? StandardCssProperties[K] | FontWeightTokensAndVars
        : K extends FontFamilyPropertyKeys
          ? StandardCssProperties[K] | FontFamilyTokensAndVars
          : K extends SpacingPropertyKeys
            ? StandardCssProperties[K] | SpacingTokensAndVars
            : StandardCssProperties[K];
} & {
  [K in keyof AliasProps]?: K extends ColorPropertyKeys
    ? AliasProps[K] | ColorTokensAndVars
    : K extends FontSizePropertyKeys
      ? AliasProps[K] | FontSizeTokensAndVars
      : K extends FontWeightPropertyKeys
        ? AliasProps[K] | FontWeightTokensAndVars
        : K extends FontFamilyPropertyKeys
          ? AliasProps[K] | FontFamilyTokensAndVars
          : K extends SpacingPropertyKeys
            ? AliasProps[K] | SpacingTokensAndVars
            : AliasProps[K];
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

export type Breakpoints = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
};
