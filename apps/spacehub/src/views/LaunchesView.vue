<script setup lang="ts">
import BaseCard from '@/components/BaseCard.vue';
import { formatLaunchDate } from '@/composables/useFormatters';
import { useSpaceData } from '@/composables/useSpaceData';

const { launches, loading } = useSpaceData();
</script>

<template>
  <main max-width="86rem" mx="auto" px="sp-4" :sm="{ paddingInline: 'var(--spacing-6)' }" py="sp-5">
    <BaseCard title="Launch Planner" subtitle="Accessible timeline of upcoming launch windows">
      <div v-if="loading" color="cl-ink" aria-live="polite">Loading launch manifest...</div>

      <ol v-else m="0" p-left="sp-4" display="grid" gap="sp-3">
        <li
          v-for="launch in launches"
          :key="launch.id"
          p="sp-3"
          border="1px solid color-mix(in oklab, var(--color-ink) 11%, transparent)"
          border-radius="br-md"
          bg="var(--color-surfaceMuted)"
        >
          <h2 m="0" fs="fs-lg">{{ launch.name }}</h2>
          <p m="0" mt="sp-1">{{ formatLaunchDate(launch.net) }}</p>
          <p m="0" mt="sp-1" color="color-mix(in oklab, var(--color-ink) 72%, transparent)">
            {{ launch.mission?.description || 'Mission profile pending publication.' }}
          </p>
        </li>
      </ol>
    </BaseCard>
  </main>
</template>
