<script setup lang="ts">
import type { VBoxStyleInput } from '@veebox/core';
import OwnedSurface from './OwnedSurface.vue';
defineProps<{
  nearer?: VBoxStyleInput;
  defaults?: VBoxStyleInput;
  as?: 'button' | 'a';
}>();
</script>
<template>
  <OwnedSurface class="nearer-caller" :as="as" :defaults="defaults" :vb="nearer"
    ><slot
  /></OwnedSurface>
</template>
