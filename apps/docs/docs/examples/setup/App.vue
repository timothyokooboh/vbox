<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';
const saved = ref(0);
const semantic = { type: 'button' as const, translate: 'no' as const };
const styles = { translate: '8px' } as const satisfies VBoxStyles;
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
}
</script>
<template>
  <main vb-p="24px">
    <button
      v-bind="semantic"
      :vb="styles"
      vb-brand-color="cl-brand"
      vb-pad2="12px"
      @click="saved++"
    >
      Save
    </button>
    <p role="status">Saved {{ saved }}</p>
    <button type="button" @click="toggleTheme">Toggle theme</button>
  </main>
</template>
