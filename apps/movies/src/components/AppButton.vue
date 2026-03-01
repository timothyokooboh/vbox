<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { pva } from '@veebox/property-variance-authority';

const props = withDefaults(
  defineProps<{
    as?: 'button' | 'a' | 'router-link';
    variant?: 'solid' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    to?: string | Record<string, unknown>;
    href?: string;
    target?: string;
    rel?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }>(),
  {
    as: 'button',
    variant: 'solid',
    size: 'md',
    type: 'button',
    disabled: false,
    target: undefined,
    rel: undefined,
    href: undefined,
    to: undefined,
  },
);

const buttonVariants = pva({
  variants: {
    variant: {
      solid: {
        bg: 'cl-brand',
        border: '1px solid color-mix(in oklab, var(--color-brand) 65%, black)',
        color: 'white',
      },
      outline: {
        bg: 'color-mix(in oklab, var(--color-canvas) 70%, transparent)',
        border:
          '1px solid color-mix(in oklab, var(--color-ink) 20%, transparent)',
        color: 'cl-ink',
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});

const resolvedStyles = computed(() =>
  buttonVariants({
    variant: props.variant,
  }),
);

const resolvedTag = computed(() => {
  if (props.as === 'router-link') return RouterLink;
  return props.as;
});

const elementProps = computed(() => {
  if (props.as === 'router-link') {
    return {
      to: props.to,
    };
  }

  if (props.as === 'a') {
    return {
      href: props.href,
      target: props.target,
      rel: props.rel,
    };
  }

  return {
    type: props.type,
    disabled: props.disabled,
  };
});
</script>

<template>
  <component
    :is="resolvedTag"
    v-bind="{ ...elementProps, ...resolvedStyles }"
    py="sp-3"
    px="sp-5"
    display="inline-flex"
    align-items="center"
    justify-content="center"
    gap="sp-2"
    border-radius="br-pill"
    text-decoration="none"
    fw="700"
    cursor="pointer"
    transition="background-color 180ms ease, border-color 180ms ease, color 180ms ease"
    :focus-visible="{
      outline: '3px solid var(--color-ring)',
      outlineOffset: '2px',
    }"
    :hover="{
      backgroundColor: 'color-mix(in oklab, var(--color-brand) 85%, white)',
      borderColor: 'color-mix(in oklab, var(--color-brand) 65%, black)',
      color: 'white',
    }"
  >
    <slot />
  </component>
</template>
