<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
</script>

<template>
  <v-box min-height="100vh" bg="var(--color-canvas)" color="cl-ink">
    <AppHeader />
    <RouterView />
  </v-box>
</template>
