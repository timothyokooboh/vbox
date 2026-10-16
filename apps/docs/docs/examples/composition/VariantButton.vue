<script setup lang="ts">
import { pva } from '@veebox/property-variance-authority';
withDefaults(
  defineProps<{ color?: 'primary' | 'danger'; size?: 'small' | 'large' }>(),
  { color: 'primary', size: 'small' },
);
const variants = pva({
  variants: {
    color: { primary: { bg: 'black' }, danger: { bg: 'maroon' } },
    size: { small: { padding: '8px' }, large: { padding: '16px' } },
  },
  defaultVariants: { color: 'primary', size: 'small' },
  compoundVariants: [
    { color: 'danger', size: 'large', styles: { border: '2px solid red' } },
  ],
});
</script>
<template>
  <button
    type="button"
    :data-tone="color"
    :data-size="size"
    :vb="variants({ color, size })"
    vb-color="white"
    :vb-hover="{ color: 'red' }"
  >
    <slot />
  </button>
</template>
