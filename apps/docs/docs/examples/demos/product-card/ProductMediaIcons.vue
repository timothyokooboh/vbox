<template>
  <button
    data-scope="product-media-icons"
    display="flex"
    justify-content="center"
    align-items="center"
    w="2.75rem"
    h="2.75rem"
    radius="br-full"
    border="1px solid rgba(255,255,255,0.1)"
    bg="rgba(255,255,255,0.1)"
    color="#fff"
    cursor="pointer"
    transition="scale 0.2s ease-in-out"
    :active="{
      scale: 0.95,
    }"
    v-bind="outlineStyles"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { outlineStyles } from '../style-utils';
</script>
