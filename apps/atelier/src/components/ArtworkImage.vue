<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Artwork } from '../api/artworks';
const props = defineProps<{ artwork: Artwork; eager?: boolean }>();
const failed = ref(false);
watch(
  () => props.artwork.image,
  () => {
    failed.value = false;
  },
);
</script>
<template>
  <div
    vb-width="100%"
    vb-height="100%"
    vb-min-height="10rem"
    vb-display="grid"
    vb-place-items="center"
  >
    <img
      v-if="artwork.image && !failed"
      :src="artwork.image"
      :alt="artwork.alt"
      :loading="eager ? 'eager' : 'lazy'"
      @error="failed = true"
      vb-display="block"
      vb-width="100%"
      vb-height="100%"
      vb-max-height="inherit"
      vb-object-fit="contain"
    />
    <span
      v-else
      role="img"
      :aria-label="`Image unavailable for ${artwork.title}`"
      vb-color="cl-muted"
      vb-padding="2rem"
      vb-text-align="center"
    >
      Image unavailable<br /><span vb-font-size="0.75rem"
        >The artwork is still worth a closer look.</span
      >
    </span>
  </div>
</template>
