# Nested Ownership And Updates - Ticket #23

The executable examples in `src/ownership/` run in both production-built clients.
They use the ordinary Vue class fallthrough introduced in ticket #7; no new root
selection, wrapper, lifecycle directive or owner-map API is needed.

```text
Caller       yellow base / blue hover
  OwnedLayer green base  / orange hover
    Surface  white base  / red hover
```

Within matching normalized contexts, the outermost active contribution wins.
Withdrawing outer base with null reveals green; withdrawing nearer base with
undefined reveals white. Hover contributions withdraw independently, revealing
orange and then red. A base change does not remove another owner's hover.

`NumericOwnership.vue` exercises the same rule for matching advanced selectors,
zero-valued opacity, explicit CSS resets, and shorthand/longhand declarations.
An explicit reset is a real declaration; null and undefined are not resets.

## Lifetime And Reuse

Vue owns the element's class list. Updating a binding removes that binding's old
contribution through Vue's normal render/update path. Replacing a root or
unmounting a component does not imperatively strip shared classes from other
elements. A shared frozen source can be internal on one target and caller-applied
on another without globally promoting either one's priority.

Rules remain cached by immutable style/config/owner-priority identity. This slice
protects active appearance, not bounded cache size or reference-counted CSS
collection. Removing rules merely because a helper was not called on the latest
render would break `v-once` and `v-memo` nodes. Those nodes legitimately retain
older active styling until Vue updates or removes them.

`CachedOwnership.vue` protects that distinction and verifies scoped-slot styling
is owned by the authoring component, not guessed from the DOM container. Class
reversal, repeated remounts, and unrelated instance registration have no effect
on the guaranteed cascade. External CSS and arbitrary selectors retain the
limits described in `COMPONENT-OVERRIDES.md` and `ADVANCED-SELECTORS.md`.

## Checks

`tests/browser/nested-owners.spec.ts` checks computed appearance and DOM lifecycle
through three withdrawal/remount/reuse cycles, across Chromium, Firefox, WebKit,
Vite and webpack. It deliberately does not inspect generated identifiers or
private registries. SSR-origin pages hydrate without runtime/hydration errors;
full request-isolation and hydration hardening remain ticket #10.

The examples are typechecked with the actual Vue consumer. Frozen style objects
remain reusable without mutation. Existing configuration-isolation and ordered
source tests continue to cover those independent inputs to rule identity.
