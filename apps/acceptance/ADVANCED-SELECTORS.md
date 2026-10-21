# Advanced selectors - ticket #6

Use `declarations` for styles and relative selector targets. Use `pseudos` for
pseudo-class/element suffixes on the current target. Lists are parsed with a CSS
selector AST, never split on commas inside functions or attribute strings.

```vue
<button
  :vb-pseudos="{ ':hover, :focus': { color: 'red' }, '::before': { content: 'attr(data-label)' } }"
  data-label="Save"
>Changes</button>

<section
  :vb-declarations="{
    '.title, .description': { color: 'cl-brand' },
    '&:is(.active, .ready)': { border: '2px solid blue' },
    '.compact-layout &': { padding: 'sp-2' },
  }"
/>
```

## Targeting And Specificity

Each top-level list branch keeps its own relative target. An unanchored selector
inside `declarations` selects descendants. A top-level `&` explicitly refers to
the current target, including ancestor conditions such as `.compact-layout &`.
Explicit relative sibling selectors retain their authored relationship; VBox does
not turn them into globally matching selectors.

`hover`, `pseudos: { ':hover': ... }`, and `declarations: { '&:hover': ... }`
share the structured interaction context. Other built-in simple state equivalents
work likewise. **`declarations: { ':hover': ... }` is different:** it targets
hovered descendants, not the root. A state's position relative to a descendant
selector remains meaningful, even under queries or themes.

Arbitrary selectors retain native specificity. A more-specific `&.active` can
beat a later `&` declaration. Compound/functional selectors are not flattened into
state flags, nor assumed equivalent to unrelated selectors. Parent-owner override
guarantees apply to matching normalized contexts/selectors, not arbitrary
specificity conflicts. Parent-owner integration is a later ticket.

To avoid an unscoped alternative, parent references only inside a function (for
example `:is(&, .outside)` in `declarations`) are rejected with an actionable
message. Supply an outer anchor (`&:is(...)`, `.ancestor &`) or separate explicitly
anchored list branches. VBox will not silently reinterpret that ambiguous target.
Pseudo suffixes already receive an outer `&` on every branch.

## Content And Composition

Pseudo-elements survive interaction, theme, breakpoint, media and container
wrappers. Ordinary source order, individual binding priority and null/undefined
withdrawal apply within matching contexts. Source objects remain immutable.

Bare `content` text is quoted with CSS string escaping, including control
characters. Explicit quoted strings, CSS-function-shaped values (`attr(...)`,
`var(...)`, `counter(...)`, `url(...)`, and future functions), reset keywords and
quote controls remain CSS. Quote a literal function-looking string explicitly if
it is intended to be displayed rather than evaluated as CSS.

External CSS, inline declarations, cascade layers and `!important` continue to
participate in the browser cascade. VBox does not raise all selectors' specificity
or promise to override those other participants.

## Validation And Evidence

Malformed lists, empty branches/functions, broken brackets, trailing/unsupported
combinators, missing attribute values and declaration/block delimiters produce
selector-specific diagnostics before rules are emitted. Unknown future pseudo
names are not rejected solely for being absent from a dataset. Browser support
still determines whether a structurally accepted selector can match.

`AdvancedSelectors.vue` runs through production Vite and webpack. Browser tests
check unrelated outside elements, comma/ampersand strings, escaped names, ancestor
references, pseudo-element computed content/colors, reactive withdrawal,
conditional wrappers, native specificity and external CSS interactions. Public
SSR tests cover validation, safe context identity and content escapes. Real Vue
editor tests cover style-only pseudo-list types and quoted content without
synthetic TypeScript errors; source-map tests retain authored expression positions.

The selector parser is a runtime dependency shared by ESM/CJS/UMD builds. It is
used only when a selector contribution is present, not for scalar declarations.
