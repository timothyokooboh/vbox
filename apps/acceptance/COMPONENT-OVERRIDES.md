# Single-root component overrides - ticket #7

Namespaced bindings on component usages become ordinary Vue class contributions,
not directives on custom components. Single-root attribute fallthrough preserves
both internal generated/user classes and caller generated/user classes.

```vue
<!-- StyledButton.vue -->
<button vb-color="white" :vb-hover="{ color: 'red' }"><slot /></button>

<!-- Usage: ordinary color is still a component prop -->
<StyledButton color="semantic" vb-color="yellow">Save</StyledButton>
```

At rest the color is yellow. On hover it is red, unless the caller supplies an
applicable hover contribution too. Null/undefined caller values withdraw only
that contribution. Internal background, theme, responsive and nested conditional
styling remains present. Grouped/direct source rules and CSS shorthand/longhand
ordering remain as documented in `SOURCE-COMPOSITION.md`.

## Ordering, Not Specificity Inflation

Explicit rule bundles retain structured context metadata in the registry and
request collector. Stylesheet serialization compares:

1. Context priority from the preceding interaction/theme/query tickets.
2. Lexical style-owner ancestry: an outer caller follows an inner component.
3. A stable bundle identity for otherwise equal, unrelated contributions.
4. Authored declaration order within the same bundle/context.

Owner ancestry is captured in component setup, not inferred from DOM placement,
class-list order, instance UID or registration time. Identity includes the owner
priority so identical style values used at different owner positions cannot
promote each other's cached rules. Re-registration does not move an entire
explicit bundle to the end of the stylesheet.

No global specificity increase or blanket caller override lane is used. Advanced
selectors still keep native specificity; the guarantee concerns matching
normalized contexts/selectors. External CSS/inline/important behavior is unchanged.

## Vue Behavior

Unprefixed component props, attrs, listeners, refs, slots, model bindings, class
arrays/objects and style arrays continue through Vue's own machinery. VBox adds
no wrapper and does not replace the component's root. Fragment/multiple-root and
`inheritAttrs: false` components must choose their own forwarding target; that
integration and diagnostics are covered by the explicit-target ticket.

The published polymorphic VBox engine retains its existing raw CSS collection
path. Its integration with new owner metadata is the later legacy-composition
ticket. This slice's override examples use native styling internally and at the
call site. Nested ownership/lifetime tests and full SSR/hydration hardening are
also subsequent slices, not claimed complete here.

## Evidence

`StyledButton.vue` and `ComponentOverrides.vue` provide executable Vite/webpack
examples. Browser cases cover matching base/hover overrides and withdrawal,
semantic props, refs/model/events/slots, class/style merging, shorthand/longhand,
theme/responsive contexts, class order reversal and unrelated registration.

Public request-collector tests reverse collection order, re-register identical
bundles, preserve raw CSS, and isolate reset. Public Vue SSR consumers verify authored class preservation and repeatable
request output. Browser cases repeatedly mount shared styling and withdraw one
caller without changing another caller's active appearance. The real editor service plus `vue-tsc` consumers check
semantic component prop types independently of style-only bindings.
