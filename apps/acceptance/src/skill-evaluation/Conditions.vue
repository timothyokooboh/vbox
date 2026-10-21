<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';

const refined = ref(false);
const base = {
  hover: { color: 'red' },
  md: { hover: { color: 'green' } },
  dark: { hover: { color: 'blue' } },
} satisfies VBoxStyles;
const refinement = {
  dark: { md: { hover: { color: 'purple' } } },
} satisfies VBoxStyles;
</script>

<template>
  <label>
    <input v-model="refined" type="checkbox" />
    Enable purple hover in dark mode at md and above
  </label>
  <button type="button" :vb="[base, refined && refinement]">
    Hover to compare conditional colors
  </button>
</template>
