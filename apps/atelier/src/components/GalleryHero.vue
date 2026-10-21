<script setup lang="ts">
import type { Artwork } from '../api/artworks';
import ArtworkImage from './ArtworkImage.vue';
defineProps<{ artwork?: Artwork }>();
</script>
<template>
  <section
    aria-labelledby="gallery-title"
    vb-display="grid"
    vb-gap="2.5rem"
    vb-padding="3rem 0 4rem"
    :vb-md="{
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'center',
      gap: '4rem',
      paddingBlock: '4.5rem',
    }"
  >
    <div>
      <p
        vb-color="cl-clay"
        vb-font-size="0.65rem"
        vb-font-weight="700"
        vb-letter-spacing="0.18em"
        vb-margin="0 0 1.5rem"
      >
        ART, WITHOUT THE HURRY
      </p>
      <h1
        id="gallery-title"
        vb-display-face="var(--font-display)"
        vb-font-size="clamp(3.7rem,7.5vw,7rem)"
        vb-font-weight="400"
        vb-line-height="0.95"
        vb-letter-spacing="-0.04em"
        vb-margin="0"
        vb-max-width="8.5em"
      >
        A little room for wonder.
      </h1>
      <p
        vb-max-width="25rem"
        vb-font-size="0.9rem"
        vb-line-height="1.8"
        vb-color="cl-muted"
        vb-margin="1.75rem 0"
      >
        Step away from the scroll. Find a painting, a quiet detail, a different
        way of seeing.
      </p>
      <a
        href="#collection"
        vb-display="inline-flex"
        vb-align-items="center"
        vb-gap="1rem"
        vb-min-height="44px"
        vb-color="cl-ink"
        vb-font-size="0.8rem"
        vb-font-weight="600"
        vb-text-underline-offset="6px"
        >Explore the collection <span aria-hidden="true">&#8595;</span></a
      >
      <p vb-font-size="0.65rem" vb-color="cl-muted" vb-margin="2rem 0 0">
        OPEN ACCESS ART <span aria-hidden="true">/</span> AN INDEPENDENT VBOX
        DEMO
      </p>
    </div>
    <figure vb-margin="0" vb-position="relative" vb-min-width="0">
      <div
        vb-bg="cl-surface"
        vb-padding="clamp(1.5rem,4vw,3rem)"
        vb-aspect-ratio="1 / 1.05"
        vb-border="1px solid cl-line"
        vb-display="grid"
        vb-place-items="center"
      >
        <ArtworkImage v-if="artwork" :artwork="artwork" eager />
        <p
          v-else
          vb-display-face="var(--font-display)"
          vb-font-size="2rem"
          vb-color="cl-muted"
        >
          A moment of discovery.
        </p>
      </div>
      <figcaption
        vb-display="flex"
        vb-justify-content="space-between"
        vb-gap="1rem"
        vb-font-size="0.65rem"
        vb-line-height="1.6"
        vb-color="cl-muted"
        vb-margin-top="1rem"
      >
        <span>{{ artwork?.title ?? 'From the open collection' }}</span
        ><span>{{ artwork?.date ?? 'ATELIER / 01' }}</span>
      </figcaption>
    </figure>
  </section>
</template>
