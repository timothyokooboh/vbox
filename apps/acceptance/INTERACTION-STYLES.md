# Interaction contexts - ticket #21

Use object-valued bindings or reusable style objects:

```vue
<button
  :vb="defaults"
  :vb-hover="{ focus: { color: 'green' } }"
  :vb-disabled="{ color: 'gray' }"
  :disabled="disabled"
>
  Save
</button>
```

`disabled` is the native semantic state. `vb-disabled` styles that state; it
neither disables the button nor substitutes for the semantic binding.
`_disabled`, `vb-_disabled` and `:vbDisabled` remain supported equivalents.
All object-valued attributes require Vue bindings, not strings containing JS.

Built-in interaction priority is low to high:

```text
hover < focusWithin < focus < focusVisible < active < disabled
```

Compare the presence of those states from highest to lowest. For example,
active beats hover+focus; focus+hover beats focus alone where both match.
Repeated states do not add priority. This is not selector-specificity arithmetic
and not a count of nested groups. Structured state selectors carry no extra
specificity; the ordered CSS implements the contract. Arbitrary selectors still
retain their own specificity and are an intentional escape hatch.

Nested groups are AND conditions. `hover: { focus: styles }` and
`focus: { hover: styles }` describe the same context on the same target. This
normalization stops at a selector that changes the target. Matching source
groups preserve unrelated declarations, and direct groups come after grouped
sources. Null/undefined removes only that contribution.

The standalone `InteractionStyles.vue` demo has keyboard/pointer targets,
conditional withdrawal, shared nested-value cases and native disabled controls.
The real-browser suite exercises CSR and hydration in all six bundler/browser
projects, reversed rendering order and authored class-list order. Compiler tests
check located guidance and the editor-service suite checks recursive style-only
types without widening semantic `disabled`.

Theme/breakpoint/query ordering and parent-owner priority continue in their own
slices; this document does not claim those are complete.
