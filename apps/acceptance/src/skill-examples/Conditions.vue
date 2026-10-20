<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';
const refined = ref(false);
const styles = {
  color: 'black',
  hover: { color: 'red' },
  md: { hover: { color: 'green' } },
  dark: { hover: { color: 'blue' } },
} satisfies VBoxStyles;
</script>
<template>
  <label
    ><input v-model="refined" type="checkbox" />Refine skill dark md
    hover</label
  >
  <button
    type="button"
    :vb="[styles, refined && { dark: { md: { hover: { color: 'purple' } } } }]"
  >
    Skill priority
  </button>
</template>
