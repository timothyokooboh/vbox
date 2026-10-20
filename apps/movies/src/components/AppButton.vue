<script setup lang="ts">
import { useMotionPreferences } from '../composables/useMotionPreferences';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { pva } from '@veebox/property-variance-authority';

const { allowViewTransition } = useMotionPreferences();

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
      viewTransition: allowViewTransition.value,
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
    v-bind="elementProps"
    :vb="resolvedStyles"
    vb-py="sp-3"
    vb-px="sp-5"
    vb-display="inline-flex"
    vb-align-items="center"
    vb-justify-content="center"
    vb-gap="sp-2"
    vb-border-radius="br-pill"
    vb-text-decoration="none"
    vb-fw="700"
    vb-cursor="pointer"
    vb-min-h="2.75rem"
    vb-white-space="nowrap"
    vb-transition="transform 160ms var(--ease-out)"
    :vb-disabled="{ opacity: 0.55, cursor: 'not-allowed' }"
    :vb-mq="{
      '@media (prefers-reduced-motion: no-preference)': {
        declarations: {
          '&:active:not(:disabled):not(:focus-visible)': {
            transform: 'scale(0.97)',
          },
        },
      },
    }"
    :vb-focus-visible="{
      outline: '3px solid var(--color-ring)',
      outlineOffset: '2px',
    }"
    :vb-hover="{
      backgroundColor: 'color-mix(in oklab, var(--color-brand) 88%, black)',
      borderColor: 'color-mix(in oklab, var(--color-brand) 65%, black)',
      color: 'white',
    }"
  >
    <slot />
  </component>
</template>
