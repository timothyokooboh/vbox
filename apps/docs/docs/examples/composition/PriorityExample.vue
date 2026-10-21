<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';
const refine = ref(false);
const contexts = {
  color: 'black',
  hover: { color: 'red' },
  md: { hover: { color: 'green' } },
  dark: { hover: { color: 'blue' } },
} as const satisfies VBoxStyles;
const refinement = {
  dark: { md: { hover: { color: 'purple' } } },
} as const satisfies VBoxStyles;
</script>
<template>
  <section
    aria-label="Priority example"
    vb-display="grid"
    vb-gap="12px"
    vb-p="16px"
    vb-border="1px solid currentColor"
  >
    <p>Hover the buttons, resize the page, and switch the docs theme.</p>
    <button
      type="button"
      :vb="[contexts, refine && refinement]"
      vb-bg="white"
      vb-p="16px"
    >
      Compare conditions
    </button>
    <label
      ><input v-model="refine" type="checkbox" /> Refine dark + md +
      hover</label
    >
    <button
      type="button"
      vb-bg="white"
      vb-p="16px"
      :vb="{ hover: { color: 'red' }, dark: { md: { color: 'black' } } }"
    >
      Interaction wins
    </button>
  </section>
</template>
