# Media and container contexts - ticket #22

Use full CSS query headers inside bound objects. Ordinary `width`, `translate`,
and component props remain semantic; the style namespace is explicit.

```vue
<div vb-container-type="inline-size" vb-container-name="card">
  <button
    vb-color="black"
    :vb-mq="{ '@media (min-width: 40rem)': { color: 'green' } }"
    :vb-cq="{ '@container card (min-width: 400px)': { hover: { color: 'blue' } } }"
  >Save</button>
</div>
```

The same `mq`/`cq` keys work inside `:vb` objects and ordered sources. Named and
unnamed container queries retain their CSS targeting; container names are
case-sensitive. A named ancestor can match even when a nearer differently named
container does not. VBox does not add wrappers or choose a container for you.

## Overlap Policy

The first differing dimension wins, from highest to lowest:

1. Interaction flags, as in `INTERACTION-STYLES.md`.
2. Theme qualification.
3. Named breakpoint flags, as in `THEME-RESPONSIVE.md`.
4. Arbitrary container-query keys.
5. Arbitrary media-query keys.
6. Source order in matching contexts; individual bindings follow grouped sources.

For each arbitrary-query family, compare the sets of query headers: the greatest
key present in only one set wins, using JavaScript's fixed UTF-16 code-unit order
(not locale ordering). A strict superset therefore refines each constituent set.
No query registry, discovery order, browser measurement, or guessed unit
conversion participates. Container queries beat media queries when the higher
three dimensions match. Named breakpoints beat otherwise generic arbitrary
queries; combine them explicitly when refinement is intended.

| Simultaneously matching declarations | Result |
| --- | --- |
| `@media (min-width: 40rem)` green; `@media (min-width: 500px)` red | Red, whichever source is encountered first |
| Same rules, plus both nested together as orange | Orange |
| `@container card (min-width: 20rem)` blue; `@container card (min-width: 400px)` purple | Purple |
| Generic media red and generic container purple | Purple |
| `md` blue and generic media red | Blue while md matches |
| Same query in two ordered style sources | Later source wins |
| Later same-query contribution becomes null or undefined | Earlier contribution reappears |

Lexical order is deliberately **not** threshold or CSS specificity order. Use
named breakpoints for the familiar increasing responsive scale. For overlapping
arbitrary queries, use an explicit combined context when a particular
intersection should win instead of relying on incidental string order.

## Conjunction And Normalization

Nested groups all have to match. Interaction-over-resting and theme-first remain
unchanged even inside queries. Same-target conditions commute and repeated
conditions deduplicate. Normalization stops at every selector boundary: a
parent's hover and a descendant's hover are not interchangeable.

Trim leading/trailing query whitespace, normalize the at-rule keyword, and keep
the remaining authored header intact. Container identifiers, units, query lists,
quoted strings and feature expressions are not rewritten. Different spellings
of logically equivalent CSS queries are not promised to share a context.

Null/undefined entries, whole groups and leaves contribute nothing. Ordered
sources and direct bindings still preserve unrelated declarations, CSS fallback
order and shorthand/longhand semantics. Inputs remain unmodified.

## Diagnostics And Limits

Query maps and children must be plain objects, not object-looking strings.
Diagnostics identify the group and offending query. Structural validation checks
the correct at-rule, a nonempty balanced header, quotes/comments, and unsafe
unquoted declaration/block delimiters. Container headers need a condition.
This is not a complete CSS grammar or `CSS.supports` query: valid-looking future
features and math contents are passed to the browser, which decides applicability.

The deterministic contract is for VBox structured declarations; arbitrary
selector specificity, external CSS, inline styles and `!important` retain normal
CSS behavior. Parent-owner priority and full SSR lifecycle are later slices.

## Executable Evidence

`src/QueryStyles.vue` runs in built Vite and webpack consumers. Browser tests vary
viewport and container sizes separately, reverse source/registration order, test
named and case-sensitive containers, exercise conjunctions and selector targets,
and withdraw leaves/groups after hydration. Public SSR tests cover malformed
input, full query headers and stable normalized identities. The real Vue editor
service checks recursive aliases/tokens/compatibility spellings and semantic
`translate` isolation. Broad completion UX remains ticket #12.
