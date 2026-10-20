<script setup lang="ts">
import type { Artwork } from '../api/artworks';
import ArtworkImage from './ArtworkImage.vue';
defineProps<{ artwork: Artwork; index: number }>();
defineEmits<{ inspect: [artwork: Artwork, event: MouseEvent] }>();
</script>
<template>
  <article vb-min-width="0">
    <button
      type="button"
      :aria-label="`View ${artwork.title}`"
      aria-haspopup="dialog"
      @click="$emit('inspect', artwork, $event)"
      vb-width="100%"
      vb-aspect-ratio="1 / 1"
      vb-bg="cl-surface"
      vb-padding="clamp(1.1rem,3vw,2.5rem)"
      vb-border="1px solid cl-line"
      vb-cursor="pointer"
      vb-display="grid"
      vb-place-items="center"
      vb-position="relative"
      :vb-focus-visible="{ outline: '3px solid cl-ring', outlineOffset: '4px' }"
      :vb-mq="{
        '@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)':
          {
            transition: 'transform 180ms ease',
            declarations: {
              '&:hover:not(:focus-visible)': { transform: 'translateY(-3px)' },
            },
          },
      }"
    >
      <ArtworkImage :artwork="artwork" />
    </button>
    <div
      vb-display="flex"
      vb-justify-content="space-between"
      vb-gap="1rem"
      vb-padding-top="1rem"
    >
      <div vb-min-width="0">
        <h3
          vb-display-face="var(--font-display)"
          vb-font-size="1.6rem"
          vb-font-weight="400"
          vb-line-height="1.15"
          vb-margin="0"
          vb-overflow-wrap="anywhere"
        >
          {{ artwork.title }}
        </h3>
        <p
          vb-margin="0.45rem 0 0"
          vb-font-size="0.75rem"
          vb-color="cl-muted"
          vb-overflow-wrap="anywhere"
        >
          {{ artwork.artist }} <span aria-hidden="true">/</span>
          {{ artwork.date }}
        </p>
      </div>
      <span
        aria-hidden="true"
        vb-color="cl-muted"
        vb-font-size="0.65rem"
        vb-padding-top="0.2rem"
        >{{ String(index + 1).padStart(2, '0') }}</span
      >
    </div>
  </article>
</template>
