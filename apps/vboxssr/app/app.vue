<script setup lang="ts">
import { ref, onMounted, useSSRContext } from 'vue';
import { keyframes } from '@veebox/core';
import { getSSRCollector, VBox } from '@veebox/vue';
const route = useRoute();
const override = ref<string | null>('yellow');
const context = import.meta.server ? useSSRContext() : undefined;
const animation = keyframes(
  'nuxt-pulse',
  { from: { opacity: 1 }, to: { opacity: 0.5 } },
  { collector: context ? getSSRCollector(context) : undefined },
);
useHead(() => ({
  htmlAttrs: { class: route.query.theme === 'dark' ? 'dark' : '' },
}));
onMounted(() => {
  document.documentElement.dataset.nuxtMounted = 'true';
});
</script>
<template>
  <main vb-bg="cl-canvas" vb-padding="24px">
    <h1 vb-font-size="2rem" vb-color="cl-brand">VBox native SSR</h1>
    <p data-testid="nuxt-token" vb-brand-color="cl-brand">
      Tokens before hydration
    </p>
    <SsrButton data-testid="nuxt-owner" :vb-color="override"
      >Owned styles</SsrButton
    >
    <button @click="override = null">Withdraw Nuxt override</button>
    <button @click="override = 'yellow'">Restore Nuxt override</button>
    <button
      data-testid="nuxt-theme"
      :vb="{
        hover: { color: 'red' },
        md: { hover: { color: 'green' } },
        dark: { hover: { color: 'blue' } },
      }"
    >
      Theme-first hover
    </button>
    <span
      data-testid="nuxt-motion"
      :vb-animation-name="animation"
      vb-animation-duration="10s"
      vb-animation-play-state="paused"
      vb-future-feature="alpha"
      >Animation</span
    >
    <VBox is="p" color="cl-brand" vb-font-weight="700"
      >Published component support</VBox
    >
    <NuxtLink to="/?theme=light" vb-color="cl-brand">Light route</NuxtLink>
    <NuxtLink to="/?theme=dark" vb-color="cl-brand">Dark route</NuxtLink>
    <NativeBoundaryExamples />
  </main>
</template>
