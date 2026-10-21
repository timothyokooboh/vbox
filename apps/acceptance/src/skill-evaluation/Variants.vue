<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';
import { pva } from '@veebox/property-variance-authority';

const variant = ref<'solid' | 'outline'>('solid');
// Keep the independent hover contribution outside PVA's shallow merge.
const base = { hover: { color: 'red' } } satisfies VBoxStyles;
const buttonVariants = pva({
  variants: {
    variant: {
      solid: {
        color: 'white',
        backgroundColor: 'black',
        border: '2px solid black',
      },
      outline: {
        color: 'black',
        backgroundColor: 'transparent',
        border: '2px solid black',
      },
    },
    size: {
      small: { padding: '8px' },
      large: { padding: '16px' },
    },
  },
  defaultVariants: { variant: 'solid', size: 'small' },
});
</script>

<template>
  <button
    type="button"
    :vb="[base, buttonVariants({ variant, size: 'large' })]"
    @click="variant = variant === 'solid' ? 'outline' : 'solid'"
  >
    Switch to {{ variant === 'solid' ? 'outline' : 'solid' }} variant
  </button>
</template>
