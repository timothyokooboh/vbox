<template>
  <p
    vb-color="tomato"
    :vb-mq="{
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }"
    :vb-animation="`${slideFromTop} 0.5s ease-in-out`"
  >
    VBox is cool
  </p>
</template>

<script setup lang="ts">
import { keyframes } from '@veebox/core';
import { getSSRCollector } from '@veebox/vue';
import { useSSRContext } from 'vue';
const context = typeof window === 'undefined' ? useSSRContext() : undefined;

const slideFromTop = keyframes(
  'slide-from-top',
  {
    from: {
      opacity: 0,
      transform: 'translateY(-15px)',
    },
    to: {
      opacity: 1,
      transform: 'none',
    },
  },
  { collector: context ? getSSRCollector(context) : undefined },
);
</script>
