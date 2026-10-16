# Component Targets

A style binding generates classes which follow Vue's normal class/attribute
fallthrough. A single-root element naturally receives both internal and caller
classes. No `vbox` marker is necessary. Ordinary component props remain
semantic.

```vue
<!-- AppButton.vue -->
<script setup lang="ts">
defineProps<{ color?: 'primary' | 'danger'; size?: 'small' | 'large' }>();
</script>
<template>
  <button
    type="button"
    :data-tone="color"
    :data-size="size"
    vb-color="white"
    vb-bg="black"
    :vb-hover="{ color: 'red' }"
  >
    <slot />
  </button>
</template>
```

```vue
<template>
  <AppButton color="primary" size="large" vb-color="yellow" @click="save"
    >Save</AppButton
  >
</template>
```

The parent changes resting color but not the child's hover. VBox does not rename
or consume the component's semantic `color`, `size` or click handler.

## Fragments and explicit forwarding

For multiple roots or `inheritAttrs: false`, choose the target explicitly. VBox
never selects the first root, inserts a wrapper, or guesses which descendant is
a button.

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
<template>
  <span id="action-help">This action saves the draft.</span>
  <button
    v-bind="$attrs"
    type="button"
    aria-describedby="action-help"
    vb-color="white"
    vb-bg="black"
  >
    <slot />
  </button>
</template>
```

Here `$attrs` forwards classes and ordinary listeners to the button. In a
reusable multi-instance component, give help text a unique ID (for example with
Vue's `useId`) rather than repeating this illustrative fixed ID. A component
that drops `class`, declares it as a prop without forwarding it, or sends it to
an unintended wrapper cannot receive the intended caller styling. Resolve that
in the component API; no compiler flag can repair an unknown target.

RouterLink/NuxtLink use their ordinary rendered-link behavior. For custom render
slots, forward the styling to the real target yourself. `template` and `slot`
are not rendered style targets. Slot content belongs to its author; it is not
implicitly restyled by a wrapper's internal defaults.

The supported [legacy `is` / `asChild` interface](./polymorphism.md) remains an
alternative when explicit polymorphism is appropriate.

## Try explicit forwarding

This live example forwards a fragment's `$attrs` into a PVA-styled button. Its
semantic `color` and `size` props remain intact, the caller changes resting text
color, and the internal hover survives. The adjacent help text is not styled.

<ForwardingExample />

<<< @/examples/composition/ForwardingExample.vue

<<< @/examples/composition/ForwardedAction.vue

<<< @/examples/composition/VariantButton.vue

<script setup lang="ts">
import ForwardingExample from '../../examples/composition/ForwardingExample.vue';
</script>
