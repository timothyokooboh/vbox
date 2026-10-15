# Source composition - ticket #4

```vue
<button :vb="[base, enabled && selected, variants(props)]" vb-padding="12px">
  Save
</button>
```

- Sources are read left to right. Individual `vb-*` bindings come after the
  grouped sources regardless of where attributes appear in the template.
- Composition retains each declaration and its context. Aliases and casing are
  normalized, but declarations are not sorted alphabetically or deduplicated.
  This matters for CSS fallbacks and shorthand/longhand ordering.
- `{ padding: '8px' }` then `{ paddingLeft: '20px' }` sets only the left side to
  20px. Reversing the sources resets all four sides to 8px.
- Null and undefined contribute nothing, including inside groups. Removing a
  source or declaration reveals the remaining styling. False omits an array
  entry only; it is not a valid top-level source or declaration value.
- Zero remains a declaration. `initial`, `inherit`, `unset` and other explicit
  CSS resets follow CSS semantics rather than acting as source withdrawal.
- Readonly/frozen inputs are never mutated. Separate instances can reuse them.
- Equivalent clean and compatibility group keys share a context. Unrelated
  declarations survive. A later base source does not erase conditional styles.
- PVA remains a plain-object shallow merger. If its result already replaced a
  nested object, VBox cannot restore the discarded declarations. Use multiple
  VBox sources when you need VBox's context-aware composition.

`SourceComposition.vue` and `tests/browser/composition.spec.ts` demonstrate
reactive insertion/removal/reordering, direct priority, physical and logical
padding, CSS invalid-value fallback, independent reuse, and SSR hydration.
`tests/composition.test.mjs` covers malformed inputs, ordered output and frozen
condition objects. The real editor service checks readonly array inputs.

This slice preserves contexts; recursive interaction/theme/query priority and
parent style-owner priority are separate follow-up tickets. It does not claim
that arbitrary selectors or external CSS obey a universal VBox-wins rule.
