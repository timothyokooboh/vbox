<template>
  <p v-bind="styles">Same styles</p>
  <p v-bind="styles">Same styles</p>
  <p v-bind="styles">Same styles</p>
</template>

<script setup lang="ts">
import type { VBoxStyleProps } from '@veebox/core';

const styles: VBoxStyleProps = {
  color: 'tomato',
  fs: '1.5rem',
  w: 'fit-content',
  transition: 'color 0.2s ease-in-out',
  hover: {
    color: 'indigo',
  },
};
</script>
