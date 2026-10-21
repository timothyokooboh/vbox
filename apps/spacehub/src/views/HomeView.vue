<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue';
import ApodGallery from '@/components/ApodGallery.vue';
import LaunchList from '@/components/LaunchList.vue';
import NeoTable from '@/components/NeoTable.vue';
import { useSpaceData } from '@/composables/useSpaceData';

const { loading, error, apodItems, launches, neos, reload } = useSpaceData();
</script>

<template>
  <main max-width="86rem" mx="auto" px="sp-4" :sm="{ paddingInline: 'var(--spacing-6)' }" py="sp-5" display="grid" gap="sp-4">
    <section
      border-radius="br-xl"
      p="sp-5"
      :sm="{ padding: 'var(--spacing-8)' }"
      bg="linear-gradient(120deg, color-mix(in oklab, var(--color-brand) 70%, transparent), color-mix(in oklab, var(--color-accent) 56%, transparent))"
      color="#fff"
      display="grid"
      gap="sp-3"
    >
      <p m="0" fs="fs-sm" fw="700" text-transform="uppercase" ls="0.12em">NASA + SpaceDevs Data</p>
      <h1 m="0" fs="fs-hero" lh="1.08">Track launches, deep space imagery, and near-Earth objects.</h1>
      <p m="0" max-width="54ch" color="color-mix(in oklab, white 88%, transparent)">
        A webpack-powered Vue 3 demo styled with VBox native syntax, accessible Radix primitives, and reusable variant-driven components.
      </p>
      <div display="flex" gap="sp-2" flex-wrap="wrap">
        <BaseButton variant="solid" @click="reload">Refresh Data</BaseButton>
        <BaseButton as="router-link" to="/launches" variant="outline">Launch Schedule</BaseButton>
      </div>
    </section>

    <p v-if="loading" m="0" color="cl-ink" aria-live="polite">Loading telemetry and media feeds...</p>

    <p
      v-else-if="error"
      m="0"
      p="sp-3"
      border-radius="br-md"
      bg="color-mix(in oklab, var(--color-danger) 14%, transparent)"
      color="cl-danger"
      role="alert"
    >
      {{ error }}
    </p>

    <template v-else>
      <ApodGallery :items="apodItems" />
      <div display="grid" gap="sp-4" :lg="{ gridTemplateColumns: '1fr 1fr' }">
        <LaunchList :launches="launches" />
        <NeoTable :items="neos" />
      </div>
    </template>
  </main>
</template>
