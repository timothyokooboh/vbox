<script setup lang="ts">
import type { VBoxStyleInput } from '@veebox/core';
defineProps<{ as?: 'button' | 'a'; defaults?: VBoxStyleInput }>();
</script>
<template>
  <component
    :is="as ?? 'button'"
    class="owned-surface"
    :vb="[
      {
        color: 'white',
        bg: 'black',
        padding: '8px',
        opacity: 0.6,
        hover: { color: 'red' },
      },
      defaults,
    ]"
    ><slot
  /></component>
</template>
