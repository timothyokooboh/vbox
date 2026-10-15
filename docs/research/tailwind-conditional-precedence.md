# Tailwind v4 Conditional Precedence

Research date: 2026-10-15. Scope: `dark:hover:text-blue-500` versus `md:hover:text-green-500` on the same style target. This note combines primary-source analysis with a compiler-output probe of published Tailwind 4.3.3; it does not claim a browser computed-style test. The package was downloaded and extracted in an isolated temporary directory with package scripts disabled, without changing VBox's manifests, lockfile, or application dependencies.

## Applicability Is Not Specificity

Both classes describe combined contexts. Default `dark` tests `prefers-color-scheme: dark`; default `md` tests `width >= 48rem`. Both also require `:hover` and Tailwind v4's `(hover: hover)` media condition. A conflict exists only while both contexts match. [Dark-mode docs](https://tailwindcss.com/docs/dark-mode), [responsive docs](https://tailwindcss.com/docs/responsive-design), [v4.3.0 `createVariants`](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.3.0/packages/tailwindcss/src/variants.ts).

Media conditions control applicability, not selector weight. For these utilities, each selector contributes one utility class plus `:hover`: specificity **(0,2,0)**. Escaped variant prefixes are part of that single class name, not additional pseudo-classes. CSS nesting does not add another copy of the parent class's specificity merely because a rule is nested. [Conditional Rules processing](https://www.w3.org/TR/css-conditional-3/#processing), [Selectors specificity](https://www.w3.org/TR/selectors-4/#specificity-rules), [CSS nesting selector](https://www.w3.org/TR/css-nesting-1/#nest-selector).

The documented class-based alternative is:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

This replaces the system-preference condition with selector matching on a `.dark` element or its descendants. `:where(...)`, including its arguments, contributes zero specificity, so the dark-hover selector remains **(0,2,0)**, tied with md-hover. It does **not** gain specificity merely because a `.dark` class appears in the selector. [Official override](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually), [Selectors `:where()`](https://www.w3.org/TR/selectors-4/#zero-matches).

## How Tailwind Orders Rules

The following implementation trace is pinned to **v4.3.0**, rather than a moving branch:

1. `createVariants` registers `hover`, then the responsive breakpoint group, then `dark`. `Variants.set` assigns registration order to new names; `Variants.compare` compares that order first, with group-specific comparators such as breakpoint ordering. Thus `dark` sorts after `md` here. [Variant registry](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.3.0/packages/tailwindcss/src/variants.ts).
2. `getVariantOrder()` sorts parsed variants with that comparator and assigns indices to distinct ordering groups. [Design system](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.3.0/packages/tailwindcss/src/design-system.ts).
3. `compileCandidates()` ORs `1n << index` for each candidate's variants into a bitset, then sorts rules numerically by that bitset before property-order, property-count, and alphabetical tie-breakers. Both candidates share the hover bit; the later dark bit makes dark-hover sort after md-hover. This is not a count of conditions or a browser specificity calculation. [Compiler](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.3.0/packages/tailwindcss/src/compile.ts).
4. The selector-form `@custom-variant` registers through `variants.static`. Replacing an existing name preserves its `order` in `Variants.set`; therefore the documented override does not move `dark` into a new ordering slot. New custom names are separately pre-registered in CSS encounter order. [Custom-variant registration](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.3.0/packages/tailwindcss/src/index.ts), [Registry replacement](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.3.0/packages/tailwindcss/src/variants.ts).

## Verified Compiler Output

The main task verified the published `tailwindcss` package version as **4.3.3** and invoked its exported `compile` function. The controlled input declared `--breakpoint-md: 48rem` and blue, green, and orange color tokens, then included the utilities directive. The same candidates were tested with the default media-based dark variant and with the documented class-based custom dark variant above.

Both modes emitted md-hover first and dark-hover second. Reversing the candidate input order produced identical CSS. Adding the explicit dark-plus-md-plus-hover orange candidate emitted that combined rule after the competing rules. Representative default-mode output was:

```css
@media (width >= 48rem) {
  @media (hover: hover) {
    .md\:hover\:text-green-500:hover {
      color: var(--color-green-500);
    }
  }
}
@media (prefers-color-scheme: dark) {
  @media (hover: hover) {
    .dark\:hover\:text-blue-500:hover {
      color: var(--color-blue-500);
    }
  }
}
```

The class-based probe emitted the second selector as `.dark\:hover\:text-blue-500:where(.dark, .dark *):hover`, again after md-hover. These are observed compiler outputs, not observations of a rendered browser. Under the matching conditions and equal-cascade assumptions described above, **blue wins**; the optional explicit combined orange rule wins when added. Version-pinned sources for the tested release: [v4.3.3 variants](https://github.com/tailwindlabs/tailwindcss/blob/v4.3.3/packages/tailwindcss/src/variants.ts), [v4.3.3 compiler](https://github.com/tailwindlabs/tailwindcss/blob/v4.3.3/packages/tailwindcss/src/compile.ts).

## Conclusion And Limits

The source-derived prediction agrees with the 4.3.3 compiler output: with these definitions, both contexts matching, and otherwise equal ordinary same-layer declarations, dark-hover's blue declaration takes precedence in both default-media and documented class-based modes. Equal specificity leaves stylesheet order decisive; HTML class-list order does not select the winner. [CSS cascade ordering](https://www.w3.org/TR/css-cascade-5/#cascade-sort), [Tailwind conflicting utilities](https://tailwindcss.com/docs/styling-with-utility-classes#conflicting-utility-classes), [Compiler ordering](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.3.0/packages/tailwindcss/src/compile.ts).

This is not a universal promise that theme conditions outrank viewport conditions. Different custom selectors can change specificity; different variant definitions can change applicability. Newly named variants have their own ordering positions. Breakpoint settings can change when `md` matches or remove it altogether. Important declarations and cascade layers can decide conflicts before specificity or source order. [Selectors rules](https://www.w3.org/TR/selectors-4/#specificity-rules), [custom registration](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.3.0/packages/tailwindcss/src/index.ts), [breakpoint customization](https://tailwindcss.com/docs/responsive-design#using-custom-breakpoints), [cascade](https://www.w3.org/TR/css-cascade-5/#cascade-sort).

The inspected live docs identify themselves as v4.3 and can change. A limited cross-check of **v4.1.13** found the same relevant registration sequence, existing-name order preservation, and bitset-first rule sorting; this is not verification of every v4 release or build configuration. [v4.1.13 variants](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.1.13/packages/tailwindcss/src/variants.ts), [v4.1.13 compiler](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v4.1.13/packages/tailwindcss/src/compile.ts).

## VBox Decision

The maintainer finalized a theme-first structured-styling contract for VBox, replacing the interim responsive-first choice: within the same interaction state, theme-specific styling overrides generic responsive styling. Therefore dark-hover blue wins in dark mode at all widths, while md-hover green applies at md and above in light mode; an explicit dark-md-hover declaration can refine both. This aligns with the tested Tailwind conflict, but does not adopt Tailwind's entire precedence model. VBox's interaction-over-resting guarantee remains unchanged. This is VBox style priority, not native CSS selector specificity. The accepted decision is recorded in [ADR 0002](../adr/0002-preserve-conditional-styles-in-overrides.md).
