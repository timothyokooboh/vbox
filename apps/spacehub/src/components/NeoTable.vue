<script setup lang="ts">
import { formatDistanceKm, formatVelocity } from '@/composables/useFormatters';
import type { NeoObject } from '@/types/space';
import BaseCard from './BaseCard.vue';

defineProps<{
  items: NeoObject[];
}>();
</script>

<template>
  <BaseCard title="Near-Earth Objects" subtitle="Next 72-hour proximity list">
    <div overflow-x="auto">
      <table w="100%" border-collapse="collapse">
        <caption
          text-align="left"
          mb="sp-2"
          color="color-mix(in oklab, var(--color-ink) 68%, transparent)"
          fs="fs-sm"
        >
          Asteroids and approach telemetry
        </caption>
        <thead>
          <tr>
            <th p="sp-2" text-align="left">Object</th>
            <th p="sp-2" text-align="left">Diameter (km)</th>
            <th p="sp-2" text-align="left">Miss Distance</th>
            <th p="sp-2" text-align="left">Velocity</th>
            <th p="sp-2" text-align="left">Risk</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            border-top="1px solid color-mix(in oklab, var(--color-ink) 9%, transparent)"
          >
            <td p="sp-2">{{ item.name }}</td>
            <td p="sp-2">
              {{ item.estimated_diameter.kilometers.estimated_diameter_min.toFixed(2) }} -
              {{ item.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2) }}
            </td>
            <td p="sp-2">
              {{ formatDistanceKm(item.close_approach_data[0]?.miss_distance.kilometers || '0') }}
            </td>
            <td p="sp-2">
              {{ formatVelocity(item.close_approach_data[0]?.relative_velocity.kilometers_per_hour || '0') }}
            </td>
            <td p="sp-2" :color="item.is_potentially_hazardous_asteroid ? 'cl-danger' : 'cl-success'">
              {{ item.is_potentially_hazardous_asteroid ? 'Potentially Hazardous' : 'Observed Safe' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseCard>
</template>
