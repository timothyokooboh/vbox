import type { StandardProperties, Pseudos } from "csstype";

/**
 * Maps shorthand keys to full CSS property names.
 * Used internally to expand alias props at runtime.
 * Example: `{ d: 'display', p: 'padding' }`
 */
export type AliasMap = Record<string, keyof StandardProperties>;

/**
 * CSS selector blocks keyed by selector strings.
 * Keys may include `&` for parent reference.
 * Example: `{ '&:first-child': { color: 'red' } }`
 */
export type Selectors = Record<string, StandardProperties>;

/**
 * A union type representing either plain CSS properties
 * or nested selector rules.
 */
export type PropertiesAndSelectors = StandardProperties | Selectors;

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
  [K in keyof AliasMap]?: StandardProperties[AliasMap[K]];
};

/**
 * Direct CSS properties supported by `csstype`, plus any defined aliases.
 *
 * Allows v-box to accept CSS properties and aliases as props.
 */
export type CSSStyleProps = {
  [K in keyof StandardProperties]?: StandardProperties[K];
} & AliasProps;

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
