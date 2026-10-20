<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
<template>
  <button
    v-bind="$attrs"
    type="button"
    vb-color="white"
    vb-bg="black"
    :vb-hover="{ color: 'red' }"
  >
    <slot />
  </button>
  <span>Fragment help stays unstyled by the caller.</span>
</template>
