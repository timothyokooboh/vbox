<script setup lang="ts">
defineProps<{ color: string; size: string }>();
</script>
<template>
  <span data-testid="semantic-component">{{ color }} / {{ size }}</span>
</template>
