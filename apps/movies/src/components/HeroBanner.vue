<script setup lang="ts">
import { computed } from 'vue';
import { getBackdropUrl } from '../api/tmdb';
import {
  getMovieRating,
  getMovieYear,
} from '../composables/useMovieFormatting';
import type { TmdbMovie } from '../types/tmdb';
import AppButton from './AppButton.vue';
import MovieTrailerDialog from './MovieTrailerDialog.vue';

const props = defineProps<{
  movie: TmdbMovie | null;
}>();

const backdrop = computed(() =>
  props.movie?.backdrop_path
    ? getBackdropUrl(props.movie.backdrop_path, 'original')
    : 'https://placehold.co/1400x800/0B1020/FFFFFF?text=VBox+Movies',
);
</script>

<template>
  <section
    vb-position="relative"
    vb-min-h="32rem"
    :vb-md="{ minHeight: '36rem', padding: 'sp-10' }"
    vb-display="grid"
    vb-align-items="end"
    vb-p="sp-6"
    vb-border-radius="br-card"
    vb-overflow="hidden"
    vb-border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
    :vb-bg-image="`linear-gradient(90deg, var(--color-canvas) 0%, color-mix(in oklab, var(--color-canvas) 92%, transparent) 35%, transparent 100%), linear-gradient(to top, var(--color-canvas), transparent), url(${backdrop})`"
    vb-bg-size="cover"
    vb-bg-position="center"
  >
    <div vb-display="grid" vb-gap="sp-3" vb-max-w="36rem">
      <p
        vb-m="0"
        vb-fs="fs-sm"
        vb-fw="700"
        vb-ls="0.1em"
        vb-text-transform="uppercase"
        vb-color="cl-accent"
      >
        Featured Tonight
      </p>

      <h1
        vb-m="0"
        vb-fs="clamp(3rem,7vw,6rem)"
        vb-fw="800"
        vb-ls="-0.055em"
        vb-overflow-wrap="anywhere"
        vb-lh="1.05"
        vb-color="cl-ink"
      >
        {{ movie?.title ?? 'Discover your next obsession' }}
      </h1>

      <p
        vb-m="0"
        vb-fs="fs-base"
        vb-lh="1.7"
        vb-max-w="48ch"
        vb-color="cl-muted"
      >
        {{
          movie?.overview ?? 'Set your TMDB key to unlock live recommendations.'
        }}
      </p>

      <p v-if="movie" vb-m="0" vb-fs="fs-sm" vb-fw="700" vb-color="cl-ink">
        {{ getMovieYear(movie) }} • ★ {{ getMovieRating(movie) }}
      </p>

      <div
        vb-display="flex"
        vb-flex-wrap="wrap"
        vb-align-items="center"
        vb-gap="sp-3"
        vb-mt="sp-4"
      >
        <MovieTrailerDialog
          v-if="movie"
          :movie-id="movie.id"
          :movie-title="movie.title"
          variant="outline"
          button-label="Play Trailer"
        />

        <AppButton
          v-if="movie"
          as="router-link"
          :to="`/movie/${movie.id}`"
          variant="solid"
        >
          View Details
        </AppButton>

        <AppButton
          as="a"
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer noopener"
          variant="outline"
          vb-display="none"
          :vb-sm="{ display: 'block' }"
        >
          TMDB Attribution
        </AppButton>
      </div>
    </div>
  </section>
</template>
