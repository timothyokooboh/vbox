<template>
  <p color="tomato" :animation="`${slideFromTop} 0.5s ease-in-out`">
    VBox is cool
  </p>
</template>

<script setup lang="ts">
import { keyframes } from '@veebox/core';

const slideFromTop = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(-15px)',
  },
  to: {
    opacity: 1,
    transform: 'none',
  },
});
</script>
