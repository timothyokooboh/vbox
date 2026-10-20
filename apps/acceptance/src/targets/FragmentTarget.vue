<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
<template>
  <span data-testid="fragment-sibling" vb-color="green">Sibling root</span>
  <button class="target-authored" v-bind="$attrs" vb-color="white">
    Forwarded target
  </button>
</template>
