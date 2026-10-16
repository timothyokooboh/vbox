<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'radix-vue';
import { computed, ref } from 'vue';
import {
  usePreferredTrailer,
  getTrailerEmbedUrl,
} from '../composables/useMovieTrailer';
import { useMovieVideosQuery } from '../composables/useTmdbQueries';
import AppButton from './AppButton.vue';

const props = withDefaults(
  defineProps<{
    movieId: number;
    movieTitle: string;
    buttonLabel?: string;
    variant?: 'solid' | 'outline';
  }>(),
  {
    buttonLabel: 'Play Trailer',
    variant: 'outline',
  },
);

const open = ref(false);
const trailerQuery = useMovieVideosQuery(
  computed(() => props.movieId),
  computed(() => open.value),
);

const preferredTrailer = usePreferredTrailer(
  computed(() => trailerQuery.data.value?.results),
);
const trailerEmbedUrl = computed(() =>
  getTrailerEmbedUrl(preferredTrailer.value),
);
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <AppButton
        as="button"
        :variant="variant"
        :aria-label="`Play trailer for ${movieTitle}`"
      >
        {{ buttonLabel }}
      </AppButton>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay
        vb-position="fixed"
        vb-inset="0"
        vb-bg="color-mix(in oklab, black 68%, transparent)"
        vb-z-index="z-modalOverlay"
      />
      <DialogContent
        vb-pos="fixed"
        vb-z-index="z-modalContent"
        vb-top="50%"
        vb-left="50%"
        vb-transform="translate(-50%, -50%)"
        vb-w="min(76rem, 95vw)"
        vb-max-h="92vh"
        vb-overflow-y="auto"
        vb-p="sp-4"
        :vb-sm="{ p: 'sp-5' }"
        vb-bg="var(--color-canvas)"
        vb-border="1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)"
        vb-border-radius="br-card"
        vb-shadow="bs-card"
      >
        <DialogTitle vb-m="0" vb-fs="fs-xl" vb-color="cl-ink">
          {{ movieTitle }} Trailer
        </DialogTitle>
        <DialogDescription
          vb-mt="sp-2"
          vb-mb="sp-4"
          vb-color="color-mix(in oklab, var(--color-ink) 72%, transparent)"
        >
          Trailer data powered by TMDB.
        </DialogDescription>

        <p v-if="trailerQuery.isFetching.value" vb-m="0" vb-color="cl-ink">
          Loading trailer...
        </p>

        <p
          v-else-if="!trailerEmbedUrl"
          vb-m="0"
          vb-color="color-mix(in oklab, var(--color-ink) 78%, transparent)"
        >
          No playable trailer is available for this title right now.
        </p>

        <iframe
          v-else
          :src="trailerEmbedUrl"
          :title="`${movieTitle} trailer player`"
          vb-w="100%"
          vb-aspect-ratio="16 / 9"
          vb-border="none"
          vb-border-radius="br-card"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
          loading="lazy"
          referrerpolicy="origin-when-cross-origin"
        />

        <div vb-mt="sp-4" vb-display="flex" vb-justify-content="flex-end">
          <DialogClose as-child>
            <button
              type="button"
              vb-px="sp-3"
              vb-py="sp-2"
              vb-border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
              vb-border-radius="br-pill"
              vb-bg="transparent"
              vb-color="cl-ink"
              vb-cursor="pointer"
            >
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
