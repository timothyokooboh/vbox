<script setup lang="ts">
import type { VBoxStyles } from '@veebox/core';
const styles = { translate: '8px', color: 'red' } satisfies VBoxStyles;
</script>
<template>
  <button type="button" translate="no" :vb="styles">
    Semantic translation stays disabled
  </button>
</template>
