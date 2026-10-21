<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
<template>
  <button v-bind="$attrs" vb-color="white">Controlled target</button>
</template>
