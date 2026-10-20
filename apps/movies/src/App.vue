<script setup lang="ts">
import { useMotionPreferences } from './composables/useMotionPreferences';
import AppHeader from './components/AppHeader.vue';

useMotionPreferences();
</script>

<template>
  <div>
    <a
      href="#main-content"
      tabindex="0"
      vb-position="fixed"
      vb-top="sp-3"
      vb-left="sp-3"
      vb-z-index="2000"
      vb-p="sp-3"
      vb-border-radius="br-card"
      vb-bg="cl-canvas"
      vb-color="cl-ink"
      vb-transform="translateY(-200%)"
      :vb-focus="{ transform: 'none' }"
      >Skip to content</a
    >
    <div vb-min-h="100vh" vb-bg="cl-canvas" vb-color="cl-ink">
      <AppHeader />
      <router-view />
    </div>
  </div>
</template>
