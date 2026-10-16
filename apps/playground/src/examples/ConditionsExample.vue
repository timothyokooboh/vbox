<script setup lang="ts">
import { ref } from 'vue';
import { VBox } from '@veebox/vue';
import type { VBoxStyleProps } from '@veebox/core';

const dark = ref(false);
const compatibility: VBoxStyleProps = {
  width: '140px',
  _disabled: { opacity: 0.5 },
  _2xl: { width: '180px' },
};
function toggleTheme() {
  dark.value = !dark.value;
  document.documentElement.classList.toggle('dark', dark.value);
}
</script>

<template>
  <section aria-labelledby="conditions-heading">
    <h2 id="conditions-heading">Conditions and compatibility</h2>
    <p>
      Hover is red below md, green at md, and blue at either size in dark mode.
      Theme wins within the same interaction state.
    </p>
    <button type="button" @click="toggleTheme" :aria-pressed="dark">
      Toggle example theme
    </button>
    <button
      type="button"
      data-testid="playground-conditions"
      vb-padding="12px"
      :vb="{
        hover: { color: 'red' },
        md: { hover: { color: 'green' } },
        dark: { hover: { color: 'blue' } },
      }"
    >
      Hover to compare conditions
    </button>
    <p>
      Resize above 2xl to widen these controls from 140px to 180px. They share a
      clean key, a reusable compatibility spelling, and the supported legacy
      component interface.
    </p>
    <button
      disabled
      data-testid="playground-clean"
      vb-width="140px"
      :vb-2xl="{ width: '180px' }"
      :vb-disabled="{ opacity: 0.5 }"
    >
      Clean disabled
    </button>
    <button disabled data-testid="playground-compatibility" :vb="compatibility">
      Compatibility _disabled
    </button>
    <VBox
      is="button"
      disabled
      data-testid="playground-legacy"
      v-bind="compatibility"
      >Legacy VBox</VBox
    >
  </section>
</template>
