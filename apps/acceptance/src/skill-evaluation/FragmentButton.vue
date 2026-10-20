<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    vb-color="white"
    vb-background-color="black"
    :vb-hover="{ color: 'red' }"
  >
    <slot />
  </button>
  <span>Use the adjacent button to perform the action.</span>
</template>
