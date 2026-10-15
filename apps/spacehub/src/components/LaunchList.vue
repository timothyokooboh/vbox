<script setup lang="ts">
import { formatLaunchDate } from '@/composables/useFormatters';
import type { LaunchResult } from '@/types/space';
import BaseCard from './BaseCard.vue';

const props = defineProps<{
  launches: LaunchResult[];
}>();

const statusColor = (status: string | undefined) => {
  if (!status) return 'cl-warning';
  if (status.toLowerCase().includes('go')) return 'cl-success';
  if (
    status.toLowerCase().includes('hold') ||
    status.toLowerCase().includes('failure')
  )
    return 'cl-danger';
  return 'cl-warning';
};
</script>

<template>
  <BaseCard
    title="Upcoming Launches"
    subtitle="Public schedules from Launch Library"
  >
    <ul list-style="none" m="0" p="0" display="grid" gap="sp-3">
      <li
        v-for="launch in launches"
        :key="launch.id"
        border="1px solid color-mix(in oklab, var(--color-ink) 11%, transparent)"
        border-radius="br-md"
        p="sp-3"
        bg="var(--color-surfaceMuted)"
      >
        <p m="0" fw="700" color="cl-ink">{{ launch.name }}</p>
        <p
          m="0"
          mt="sp-1"
          color="color-mix(in oklab, var(--color-ink) 72%, transparent)"
          fs="fs-sm"
        >
          {{ launch.launch_service_provider?.name || 'Unknown provider' }} ·
          {{ launch.pad?.name || 'Pad TBD' }}
        </p>
        <p m="0" mt="sp-1" fs="fs-sm" color="cl-ink">
          {{ formatLaunchDate(launch.net) }}
        </p>
        <p m="0" mt="sp-1" fs="fs-xs" :color="statusColor(launch.status?.name)">
          {{ launch.status?.name || 'Status unavailable' }}
        </p>
      </li>
    </ul>
  </BaseCard>
</template>
