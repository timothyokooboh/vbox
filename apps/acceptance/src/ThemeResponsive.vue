<script setup lang="ts">
import { ref } from 'vue';
import ConfiguredTargets from './ConfiguredTargets.vue';
import type { VBoxStyles } from '@veebox/core';
const refine = ref(false);
const contexts: VBoxStyles = {
  dark: { hover: { color: 'blue' } },
  md: { hover: { color: 'green' } },
  hover: { color: 'red' },
};
const named: VBoxStyles = {
  '2xl': { color: 'purple' },
  xl: { color: 'orange' },
  lg: { color: 'blue' },
  md: { color: 'green' },
  sm: { color: 'red' },
  color: 'black',
};
</script>
<template>
  <section aria-label="Theme and responsive priorities">
    <button
      data-testid="theme-hover"
      :vb="[
        contexts,
        refine && { dark: { md: { hover: { color: 'orange' } } } },
      ]"
    >
      Theme priority
    </button>
    <button
      data-testid="theme-reordered"
      :vb="[
        {
          hover: {
            color: 'red',
            md: { color: 'green' },
            dark: { color: 'blue' },
          },
        },
        refine && { hover: { md: { dark: { color: 'orange' } } } },
      ]"
    >
      Equivalent nesting
    </button>
    <button @click="refine = !refine">Toggle combined refinement</button>
    <button
      data-testid="theme-resting"
      :vb="{
        dark: { md: { color: 'green' } },
        hover: { color: 'red' },
        color: 'black',
      }"
    >
      Interaction beats resting
    </button>
    <ConfiguredTargets />
    <p
      data-testid="clean-2xl"
      :vb-2xl="{ color: 'red' }"
      :vb-_2xl="{ opacity: 0.5 }"
    >
      2xl spellings
    </p>
    <p data-testid="named-breakpoints" :vb="named">Named order</p>
  </section>
</template>
