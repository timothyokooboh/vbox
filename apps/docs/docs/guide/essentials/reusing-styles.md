# Reusing Styles

Attach style-only objects with `:vb`. Ordinary `v-bind` remains available for
semantic props and events. `VBoxStyles` supports recursive conditions and null
withdrawal; existing `VBoxStyleProps` objects remain reusable. `VBoxProps` also
includes component targeting options, so prefer a style-only type for new
objects.

<<< @/examples/ExampleThirtyOne.vue

<ExampleThirtyOne />

## Ordered sources

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';
const highlighted = ref(true);
const base = {
  color: 'red',
  padding: '12px',
  hover: { color: 'blue', fontWeight: 700 },
} as const satisfies VBoxStyles;
const extra = {
  color: 'green',
  hover: { color: 'purple' },
} as const satisfies VBoxStyles;
</script>
<template>
  <button
    :vb-color="highlighted ? 'yellow' : null"
    :vb="[base, highlighted && extra]"
  >
    Save
  </button>
</template>
```

Later sources override earlier declarations in matching contexts. Nested groups
preserve unrelated declarations: the hover remains bold here. Individual
bindings win over grouped styling **regardless of template attribute order**.
VBox does not mutate supplied objects or readonly arrays.

`null` and `undefined` mean no contribution. Withdrawing the direct color
reveals the remaining grouped color, not an erased component default. `false` is
an omitted array entry, not a CSS scalar or a standalone grouped object. Numeric
zero and explicit CSS values such as `initial`, `inherit` and `unset` remain
declarations.

Composition retains CSS shorthand semantics. Later `paddingLeft: '24px'` changes
only the left side of an earlier `padding: '12px'`; a later `padding: '8px'`
intentionally replaces all four sides of earlier longhands. Ordered CSS fallback
values remain ordered. Style-source arrays and CSS fallback arrays serve
different purposes.

Compatibility keys such as `_disabled` and clean `disabled` normalize to the
same context. Source order resolves conflicts; neither spelling gets special
priority.

## PVA

`@veebox/property-variance-authority` is framework-independent and returns
ordinary style objects. Use `:vb="buttonVariants({ variant, size })"` on a
native element, not an ordinary style `v-bind` spread.

```ts
import { pva } from '@veebox/property-variance-authority';

export const buttonVariants = pva({
  variants: {
    variant: {
      solid: { color: 'white', bg: 'cl-brand' },
      outline: { color: 'cl-brand', bg: 'transparent' },
    },
    size: {
      sm: { padding: '8px' },
      lg: { padding: '16px' },
    },
  },
  defaultVariants: { variant: 'solid', size: 'sm' },
  compoundVariants: [
    {
      variant: 'outline',
      size: 'lg',
      styles: { border: '2px solid cl-brand' },
    },
  ],
});
```

PVA's own merging remains shallow. VBox composes what PVA returns; it cannot
recover nested contributions PVA already replaced. To preserve separate
contributions, supply them as separate entries in `:vb`.

<script setup lang="ts">
import ExampleThirtyOne from '../../examples/ExampleThirtyOne.vue'
</script>
