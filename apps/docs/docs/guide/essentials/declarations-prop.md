# Declarations and Selectors

`:vb-declarations` groups base declarations, CSS custom properties and arbitrary
selectors. Condition groups also support nested selectors.

<<< @/examples/ExampleTwentyNine.vue

<ExampleTwentyNine />

## Custom properties and vendor declarations

<<< @/examples/ExampleThirty.vue

<ExampleThirty />

Custom properties can also use `vb---accent="red"` (the `vb-` namespace plus
`--accent`), or `:vb="{ '--accent': 'red' }"`. Their spelling remains
case-sensitive. Vendor declarations can be expressed inside grouped styling:

```vue
<template>
  <div
    :vb="{ '-webkit-user-select': 'none', '--accent': 'tomato' }"
    vb-color="var(--accent)"
  >
    A styled element
  </div>
</template>
```

VBox's CSS serializer adds applicable vendor prefixes. Authored future/vendor
CSS is not filtered through browser `CSS.supports`; an unsupported declaration
is left for the browser to ignore consistently with ordinary CSS.

## Selector boundaries

Selectors keep their native specificity. Use `&` for the current style target;
descendant selectors, sibling selectors, lists and pseudo-elements retain their
intended targets. Simple recognized equivalents, such as a hover shorthand and
`pseudos: { ':hover': ... }`, share a structured context. Distinct arbitrary
selectors do not become equivalent merely because they overlap on an element.

The deterministic parent-override contract covers matching normalized contexts
and selectors. External CSS, inline styles and `!important` can still win
through the browser's cascade. See [style priority](./style-priority.md).

<script setup lang="ts">
import ExampleTwentyNine from '../../examples/ExampleTwentyNine.vue'
import ExampleThirty from '../../examples/ExampleThirty.vue'
</script>
