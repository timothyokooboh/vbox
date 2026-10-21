---
name: vbox-native
description:
  Build, migrate, or debug Vue styling with VBox's explicit vb-* and :vb API,
  including reusable style objects, component forwarding, conditional priority,
  and SSR. Use for VBox projects, not unrelated CSS or Tailwind work.
---

# VBox Native Styling

## Version boundary

Read [compatibility.json](compatibility.json) before changing a consumer. This
artifact targets the unreleased explicit-native contract, not the currently
older published API. Match the artifact's source revision or an explicitly
listed future beta range. A package version alone cannot distinguish this
workspace source from the older published artifact. If the consumer has only
published VBox, retain its polymorphic API instead of silently introducing
native syntax.

## Semantic boundary

Use `vb-*` for individual styling and `:vb="styles"` for reusable objects or
ordered sources. Leave ordinary Vue attributes, props, events, dynamic names and
`v-bind` semantic. Object keys remain unprefixed. Prefer kebab-case template
names; Vue SFC camelCase forms also work. Bind condition objects as expressions,
not object-looking strings. Read [native syntax](references/native-syntax.md)
for collisions, custom properties, and supported template forms.

A semantic `translate="no"` can coexist with `vb-translate="8px"`; a component's
`color` prop is not the same thing as `vb-color`. Preserve intrinsic dimensions,
URLs, ARIA attributes and disabled state deliberately rather than prefixing all
attributes during migration. Use `:vb-sm="{ padding: '12px' }"`, not colon
utility syntax. Retired markers and force/inference options have no place in the
new contract. Read [migration](references/migration.md) when updating old
examples.

## Composition and targeting

For reusable objects or PVA, read [composition](references/reusing-styles.md).
Later grouped sources win matching conflicts; individual bindings win over the
group. Null/undefined contribute nothing; false is an omitted array entry. Keep
zero and explicit CSS resets. `_disabled`/`_2xl` compatibility spellings remain
valid inside objects, including objects reused with published VBox. PVA returns
an ordinary object: VBox cannot recover declarations that PVA already discarded.

For caller overrides or overlapping conditions, read
[priority](references/style-priority.md). Internal styles are defaults; callers
win matching contexts without erasing unrelated internal conditions. Theme wins
generic responsive styling within the same interaction: dark hover remains blue
even above md unless a dark-md-hover refinement is supplied. Mount order and
class-list order are not priority controls. External CSS retains its own
cascade.

For custom components, read [targets](references/component-targets.md). Follow
Vue class fallthrough for single roots. Fragments or `inheritAttrs: false` must
forward `$attrs` to the chosen element explicitly; never insert a wrapper or
silently select a root. Keep semantic props and events intact.

## Project integration

Use the existing Vite or webpack adapter and runtime registration. Discover
aliases/tokens from the project's `vbox.config.*`; an explicit compiler
`aliases` list replaces discovered custom metadata. Runtime configuration still
determines what aliases mean. For setup or editor/type generation, read
[installation](references/installation.md). Token previews explain
configuration; a preview on a semantic prop does not mean the compiler styles
it.

For server rendering, read [SSR](references/ssr-support.md): request-local
collection and critical CSS injection are required, not merely SSR-safe imports.
For continuously varying animation values, use stable generated declarations
with ordinary inline CSS variables rather than accumulating unique style values.

## Validate the requested change

Use the consumer's actual compiler, public type checker and browser tests. Check
computed styles, keyboard/focus behavior and semantic attributes rather than
generated class hashes. Native HTML improves static accessibility analysis; it
does not certify WCAG compliance. Respect reduced motion and existing design
choices. Do not publish packages, deploy, or change global agent installation
unless the user separately requested those actions.

Standalone examples: [semantic collision](examples/SemanticCollision.vue),
[PVA composition](examples/Variants.vue),
[fragment forwarding](examples/Forwarding.vue), and
[theme/responsive priority](examples/Conditions.vue).
