# Supported Legacy Component

The published `<VBox>` / `<v-box>` component remains supported. It is an
alternative to the recommended [native interface](./native-syntax.md), not a
requirement for styling native tags and not a deprecated API.

## `is`

`is` chooses a native tag; omitting it renders a `div`. The legacy component
accepts unprefixed style props and ordinary style-object `v-bind` as before.

<<< @/examples/ExampleThree.vue

<ExampleThree />

## `asChild`

`asChild` adopts exactly one rendered child without adding a wrapper. It merges
classes, refs and ordinary listeners with that target. Comments and conditional
branches must still leave exactly one eligible rendered child; multiple elements
or text-only targets are not silently guessed.

<<< @/examples/ExampleFour.vue

<ExampleFour />

New `vb-*` / `:vb` bindings also work on VBox, with the same context-sensitive
composition rules. Reusable style objects may keep `_disabled` and `_2xl`.

```vue
<template>
  <VBox is="button" color="white" :hover="{ color: 'red' }" vb-color="yellow"
    >Save</VBox
  >
</template>
```

Resting color is yellow and hover is red. The class/attrs forwarding
requirements of any adopted custom component still apply. Native tags expose
their semantics to accessibility tools more directly; polymorphic/custom
components may require tool-specific configuration and manual checks. Neither
interface guarantees accessibility by itself.

<script setup lang="ts">
import ExampleThree from '../../examples/ExampleThree.vue'
import ExampleFour from '../../examples/ExampleFour.vue'
</script>
