<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = withDefaults(
  defineProps<{
    as?: 'button' | 'a' | 'router-link';
    variant?: 'solid' | 'outline';
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
    type: 'button',
    disabled: false,
    target: undefined,
    rel: undefined,
    href: undefined,
    to: undefined,
  },
);

const isSolid = computed(() => props.variant === 'solid');

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
    v-bind="elementProps"
    display="inline-flex"
    align-items="center"
    justify-content="center"
    gap="sp-2"
    px="sp-4"
    py="sp-3"
    border-radius="br-pill"
    text-decoration="none"
    fw="700"
    cursor="pointer"
    @mouseover="count++"
    :bg="
      isSolid
        ? 'cl-brand'
        : 'color-mix(in oklab, var(--color-canvas) 70%, transparent)'
    "
    :border="
      isSolid
        ? '1px solid color-mix(in oklab, var(--color-brand) 65%, black)'
        : '1px solid color-mix(in oklab, var(--color-ink) 20%, transparent)'
    "
    :color="isSolid ? 'white' : 'cl-ink'"
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
