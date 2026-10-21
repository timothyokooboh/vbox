<template>
  <button
    data-scope="product-media-icons"
    vb-display="flex"
    vb-justify-content="center"
    vb-align-items="center"
    vb-w="2.75rem"
    vb-h="2.75rem"
    vb-radius="br-full"
    vb-border="1px solid rgba(255,255,255,0.1)"
    vb-bg="rgba(255,255,255,0.1)"
    vb-color="#fff"
    vb-cursor="pointer"
    vb-transition="scale 0.2s ease-in-out"
    :vb-active="{
      scale: 0.95,
    }"
    :vb="outlineStyles"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { outlineStyles } from '../style-utils';
</script>
