# Explicit Targets And Legacy Composition - Ticket #24

## Choose A Target, Not A Wrapper

A component with several roots, or with `inheritAttrs: false`, decides where
ordinary Vue attributes (including generated style classes) belong:

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
<template>
  <span>Label</span>
  <button v-bind="$attrs" vb-color="white"><slot /></button>
</template>
```

`<Component vb-color="yellow" />` styles that button, not the label. It preserves
its default white when the caller withdraws yellow. VBox never selects the first
root or inserts a DOM wrapper. Without forwarding, no styling is applied to a
root. Vue's existing extraneous-attribute diagnostic remains available for
ambiguous automatic fallthrough; deliberately disabling inheritance is not an
error and cannot reliably be diagnosed as missing forwarding.

`FragmentTarget.vue`, `ControlledTarget.vue` and `UnforwardedTarget.vue` are
executable examples in `src/targets/`.

## Old And New Bindings Together

```vue
<VBox is="button" color="white" :hover="{ color: 'red' }"
  vb-color="yellow" :vb-hover="{ color: 'blue' }">Save</VBox>
```

The result is yellow at rest and blue on hover. Removing the caller hover reveals
red; removing caller base reveals white. The legacy component now supplies its
styling to the same context-aware registry as explicit bindings. It does not use
a higher-specificity hover selector that prevents matching caller overrides.

Only the polymorphic legacy boundary interprets unprefixed styling: known CSS
properties, configured/default aliases, custom properties and condition groups.
Its semantic attrs, classes, inline style objects and listeners still flow
through Vue. Native semantic `disabled` stays a boolean, while `_disabled` is a
supported style group. Runtime-only usage does not require the template compiler.
Unknown/future style names have the explicit namespace/grouped style boundary;
HTML/component bindings are not globally reclassified to accommodate them.

## Adoption

`asChild` requires exactly one element or component child. Comments and whitespace
are ignored; fragments are flattened without discarding nonempty text. Empty,
text-only, or multiple eligible children produce a useful warning and no chosen
root. These constraints apply to production too, not only development builds.

Slots are evaluated during Vue rendering. Changing the child tag, slot content,
or `asChild` after mount keeps Vue tracking, refs, merged classes/inline styles,
and listeners. Adopting a component does not bypass its own root-forwarding
contract: a fragment component must still forward explicitly.

## Links And Accessible Primitives

`PrimitiveTargets.vue` uses the actual Vue Router `RouterLink` and Radix Vue
`Toggle` with `asChild`, plus a small NuxtLink-style forwarding wrapper. There is
no component-name eligibility exception. The wrapper is not a claim of full
Nuxt integration coverage; that belongs to the SSR application slice.

The browser cases exercise navigation, accessible names, keyboard activation,
pressed state, model updates, and both direct and legacy VBox adoption. Public
SSR consumers exercise compiler-free props, underscore groups, valid/invalid
adoption and Vue forwarding diagnostics. Real editor checks preserve `is` prop
typing alongside grouped styling. All consumer SFCs also undergo `vue-tsc`.
