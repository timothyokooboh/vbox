<script setup lang="ts">
import type { VBoxStyleInput } from '@veebox/core';
defineProps<{ styles: VBoxStyleInput }>();
</script>
<template>
  <button translate="no" type="button" :vb="styles">Native styling</button>
  <v-box is="p" color="purple">Published styling</v-box>
  <p color="red">Semantic only</p>
</template>
