<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
</script>

<template>
  <v-box>
    <div min-h="100vh" bg="cl-canvas" color="cl-ink">
      <AppHeader />
      <router-view />
    </div>
  </v-box>
</template>
