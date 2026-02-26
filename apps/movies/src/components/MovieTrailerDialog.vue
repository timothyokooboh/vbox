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
        vbox
        position="fixed"
        inset="0"
        bg="color-mix(in oklab, black 68%, transparent)"
        z-index="z-modalOverlay"
      />
      <DialogContent
        vbox
        pos="fixed"
        z-index="z-modalContent"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="min(76rem, 95vw)"
        max-h="92vh"
        overflow-y="auto"
        p="sp-4"
        :sm="{ p: 'sp-5' }"
        bg="var(--color-canvas)"
        border="1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)"
        border-radius="br-card"
        shadow="bs-card"
        z="1101"
      >
        <DialogTitle vbox m="0" fs="fs-xl" color="cl-ink">
          {{ movieTitle }} Trailer
        </DialogTitle>
        <DialogDescription
          vbox
          mt="sp-2"
          mb="sp-4"
          color="color-mix(in oklab, var(--color-ink) 72%, transparent)"
        >
          Trailer data powered by TMDB.
        </DialogDescription>

        <p v-if="trailerQuery.isFetching.value" m="0" color="cl-ink">
          Loading trailer...
        </p>

        <p
          v-else-if="!trailerEmbedUrl"
          m="0"
          color="color-mix(in oklab, var(--color-ink) 78%, transparent)"
        >
          No playable trailer is available for this title right now.
        </p>

        <iframe
          v-else
          :src="trailerEmbedUrl"
          :title="`${movieTitle} trailer player`"
          w="100%"
          aspect-ratio="16 / 9"
          border="none"
          border-radius="br-card"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
          loading="lazy"
          referrerpolicy="origin-when-cross-origin"
        />

        <div mt="sp-4" display="flex" justify-content="flex-end">
          <DialogClose as-child>
            <button
              type="button"
              px="sp-3"
              py="sp-2"
              border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
              border-radius="br-pill"
              bg="transparent"
              color="cl-ink"
              cursor="pointer"
            >
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
