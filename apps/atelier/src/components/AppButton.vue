<script setup lang="ts">
import { computed } from 'vue';
import { pva } from '@veebox/property-variance-authority';
const props = withDefaults(
  defineProps<{
    variant?: 'solid' | 'outline' | 'quiet';
    type?: 'button' | 'submit';
  }>(),
  { variant: 'solid', type: 'button' },
);
const variants = pva({
  variants: {
    variant: {
      solid: {
        bg: 'cl-brand',
        color: 'cl-onBrand',
        border: '1px solid transparent',
      },
      outline: {
        bg: 'transparent',
        color: 'cl-ink',
        border: '1px solid cl-line',
      },
      quiet: {
        bg: 'transparent',
        color: 'cl-muted',
        border: '1px solid transparent',
      },
    },
  },
  defaultVariants: { variant: 'solid' },
});
const styles = computed(() => variants({ variant: props.variant }));
</script>
<template>
  <button
    :type="type"
    :vb="styles"
    vb-min-height="44px"
    vb-padding="0.7rem 1.2rem"
    vb-font-family="inherit"
    vb-font-size="0.8125rem"
    vb-font-weight="600"
    vb-line-height="1.4"
    vb-border-radius="br-pill"
    vb-cursor="pointer"
    vb-display="inline-flex"
    vb-align-items="center"
    vb-justify-content="center"
    vb-gap="0.65rem"
    :vb-hover="{ bg: 'cl-ink', color: 'cl-paper' }"
    :vb-focus-visible="{ outline: '3px solid cl-ring', outlineOffset: '3px' }"
    :vb-disabled="{ opacity: 0.6, cursor: 'not-allowed' }"
  >
    <slot />
  </button>
</template>
