<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
</script>

<template>
  <div>
    <div vb-min-h="100vh" vb-bg="cl-canvas" vb-color="cl-ink">
      <AppHeader />
      <router-view />
    </div>
  </div>
</template>
