<script setup lang="ts">
// A consumer's unrelated local directive must not capture generated styling.
const vVboxRuntime = {
  mounted(el: HTMLElement) {
    el.dataset.localDirective = 'used';
  },
};
</script>
<template>
  <p data-testid="directive-collision" vb-color="purple">Independent styling</p>
  <p v-vbox-runtime data-testid="local-directive">Local directive</p>
</template>
