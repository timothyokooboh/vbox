<script setup lang="ts">
import { pva } from '@veebox/property-variance-authority';

withDefaults(defineProps<{ variant?: 'solid' | 'outline' }>(), {
  variant: 'solid',
});
const variants = pva({
  variants: {
    variant: {
      solid: { bg: '#123456', color: 'white' },
      outline: { bg: 'transparent', color: 'black' },
    },
  },
  defaultVariants: { variant: 'solid' },
});
</script>

<template>
  <button
    type="button"
    :vb="variants({ variant })"
    vb-padding="10px"
    vb-border="1px solid #123456"
    vb-radius="8px"
    :vb-hover="{ color: 'red' }"
  >
    <slot />
  </button>
</template>
