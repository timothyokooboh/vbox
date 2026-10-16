<script setup lang="ts">
import { ref, defineAsyncComponent, useSSRContext } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { keyframes } from '@veebox/core';
import { getSSRCollector, VBox } from '@veebox/vue';
import OwnedLayer from '../ownership/OwnedLayer.vue';
const route = useRoute();
const router = useRouter();
const LazySurface = defineAsyncComponent(() => import('./LazySurface.vue'));
const override = ref<string | null>('yellow');
const context = typeof window === 'undefined' ? useSSRContext() : undefined;
const animation = keyframes('ssr-pulse', { from: { opacity: 1 }, to: { opacity: 0.5 } }, { collector: context ? getSSRCollector(context) : undefined });
const shared = Object.freeze({ color: 'yellow' });
</script>
<template>
  <article vb-color="cl-brand" aria-label="Hydration fixture">
    <h1 vb-font-size="fs-xl">Server styling</h1>
    <button @click="router.push('/late')">Load styled route</button>
    <button @click="override = null">Withdraw hydrated override</button>
    <button @click="override = 'yellow'">Restore hydrated override</button>
    <OwnedLayer data-testid="ssr-owned" :vb-color="override">Owned before hydration</OwnedLayer>
    <button data-testid="ssr-theme" :vb="{ hover: { color: 'red' }, md: { hover: { color: 'green' } }, dark: { hover: { color: 'blue' } } }">Theme before hydration</button>
    <span data-testid="ssr-motion" :vb-animation-name="animation" vb-animation-duration="10s" vb-animation-play-state="paused" vb-future-feature="alpha">Animation</span>
    <VBox is="p" color="cl-brand" vb-font-weight="700" data-testid="ssr-legacy">Legacy before hydration</VBox>
    <LazySurface v-if="route.path === '/late'" data-testid="ssr-lazy" :vb="shared" />
  </article>
</template>
