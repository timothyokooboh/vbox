<script setup lang="ts">
import VariantButton from './VariantButton.vue';
defineOptions({ inheritAttrs: false });
</script>

<template>
  <span
    id="fragment-note"
    data-testid="playground-fragment-note"
    vb-color="#505050"
    >Only the button receives the caller's bindings.</span
  >
  <VariantButton v-bind="$attrs" aria-describedby="fragment-note"
    ><slot
  /></VariantButton>
</template>
