<script setup lang="ts">
import type { ApodItem } from '@/types/space';
import BaseCard from './BaseCard.vue';
import ImageDialog from './ImageDialog.vue';

defineProps<{
  items: ApodItem[];
}>();
</script>

<template>
  <BaseCard title="Astronomy Photo Journal" subtitle="Curated NASA APOD imagery">
    <div
      display="grid"
      grid-template-columns="repeat(auto-fill,minmax(16rem,1fr))"
      gap="sp-3"
    >
      <ImageDialog
        v-for="item in items"
        :key="item.date + item.title"
        :title="item.title"
        :description="item.explanation"
        :image-url="item.hdurl || item.url"
      >
        <figure
          m="0"
          bg="var(--color-surfaceMuted)"
          border-radius="br-md"
          overflow="hidden"
          border="1px solid color-mix(in oklab, var(--color-ink) 9%, transparent)"
        >
          <img
            :src="item.url"
            :alt="item.title"
            w="100%"
            h="11rem"
            object-fit="cover"
            loading="lazy"
          />
          <figcaption p="sp-3">
            <p m="0" fs="fs-sm" fw="700" color="cl-ink">{{ item.title }}</p>
            <p
              m="0"
              mt="sp-1"
              fs="fs-xs"
              color="color-mix(in oklab, var(--color-ink) 70%, transparent)"
            >
              {{ item.date }}
            </p>
          </figcaption>
        </figure>
      </ImageDialog>
    </div>
  </BaseCard>
</template>
