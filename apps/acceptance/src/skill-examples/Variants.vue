<script setup lang="ts">
import { ref } from 'vue';
import { pva } from '@veebox/property-variance-authority';
import type { VBoxStyles } from '@veebox/core';
const variant = ref<'solid' | 'outline'>('solid');
const base = { padding: '8px', hover: { color: 'red' } } satisfies VBoxStyles;
const variants = pva({
  variants: {
    variant: {
      solid: { color: 'white', backgroundColor: 'black' },
      outline: { color: 'black', backgroundColor: 'transparent' },
    },
    size: { sm: { padding: '8px' }, lg: { padding: '16px' } },
  },
  defaultVariants: { variant: 'solid', size: 'sm' },
  compoundVariants: [
    { variant: 'outline', size: 'lg', styles: { border: '2px solid black' } },
  ],
});
</script>
<template>
  <button
    type="button"
    :vb="[base, variants({ variant, size: 'lg' })]"
    @click="variant = variant === 'solid' ? 'outline' : 'solid'"
  >
    Toggle skill variant
  </button>
</template>
