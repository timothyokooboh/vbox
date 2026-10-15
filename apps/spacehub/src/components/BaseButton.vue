<script setup lang="ts">
import { computed } from 'vue';
import { pva } from '@veebox/property-variance-authority';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    as?: 'button' | 'a' | 'router-link';
    to?: string;
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }>(),
  {
    variant: 'solid',
    size: 'md',
    as: 'button',
    type: 'button',
    disabled: false,
  },
);

const buttonPva = pva({
  variants: {
    variant: {
      solid: {
        color: '#fff',
        bg: 'cl-brand',
        border: '1px solid color-mix(in oklab, var(--color-brand) 75%, black)',
      },
      outline: {
        color: 'cl-ink',
        bg: 'transparent',
        border: '1px solid color-mix(in oklab, var(--color-ink) 22%, transparent)',
      },
      ghost: {
        color: 'cl-ink',
        bg: 'transparent',
        border: '1px solid transparent',
      },
    },
    size: {
      sm: { px: 'sp-3', py: 'sp-2', fs: 'fs-sm' },
      md: { px: 'sp-4', py: 'sp-3', fs: 'fs-md' },
      lg: { px: 'sp-5', py: 'sp-3', fs: 'fs-lg' },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
  compoundVariants: [
    {
      variant: 'ghost',
      size: 'sm',
      styles: {
        px: 'sp-2',
      },
    },
  ],
});

const styleProps = computed(() =>
  buttonPva({
    variant: props.variant,
    size: props.size,
  }),
);
</script>

<template>
  <component
    :is="as"
    :to="to"
    :href="href"
    :type="as === 'button' ? type : undefined"
    :disabled="disabled"
    v-bind="styleProps"
    border-radius="br-pill"
    display="inline-flex"
    align-items="center"
    justify-content="center"
    gap="sp-2"
    fw="700"
    cursor="pointer"
    text-decoration="none"
    transition="transform 180ms ease, background-color 220ms ease, color 220ms ease"
    :hover="disabled ? undefined : { transform: 'translateY(-1px)', backgroundColor: 'color-mix(in oklab, var(--color-brand) 86%, white)' }"
    :focus-visible="{ outline: 'none', boxShadow: 'var(--box-shadow-focus)' }"
    :_disabled="{ opacity: '0.55', cursor: 'not-allowed', transform: 'none' }"
  >
    <slot />
  </component>
</template>
