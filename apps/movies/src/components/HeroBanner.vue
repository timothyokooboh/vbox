<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import gsap from 'gsap';
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

const heroRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

const backdrop = computed(() =>
  props.movie?.backdrop_path
    ? getBackdropUrl(props.movie.backdrop_path, 'original')
    : 'https://placehold.co/1400x800/0B1020/FFFFFF?text=VBox+Movies',
);

onMounted(() => {
  if (!heroRef.value || !contentRef.value) return;

  gsap.fromTo(
    heroRef.value,
    { opacity: 0, scale: 1.02 },
    { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
  );

  gsap.fromTo(
    contentRef.value.children,
    { y: 18, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out' },
  );
});
</script>

<template>
  <section
    ref="heroRef"
    vb-position="relative"
    vb-min-h="60vh"
    vb-display="grid"
    vb-align-items="end"
    vb-p="sp-5"
    vb-border-radius="br-card"
    vb-overflow="hidden"
    vb-border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
    vb-shadow="bs-card"
    :vb-bg-image="`linear-gradient(to top, color-mix(in oklab, var(--color-canvas) 92%, transparent), color-mix(in oklab, var(--color-canvas) 24%, transparent)), url(${backdrop})`"
    vb-bg-size="cover"
    vb-bg-position="center"
  >
    <div ref="contentRef" vb-display="grid" vb-gap="sp-3" vb-max-w="42rem">
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

      <h1 vb-m="0" vb-fs="clamp(2rem,6vw,4rem)" vb-lh="1.02" vb-color="cl-ink">
        {{ movie?.title ?? 'Discover your next obsession' }}
      </h1>

      <p
        vb-m="0"
        vb-fs="fs-base"
        vb-color="color-mix(in oklab, var(--color-ink) 86%, transparent)"
      >
        {{
          movie?.overview ?? 'Set your TMDB key to unlock live recommendations.'
        }}
      </p>

      <p v-if="movie" vb-m="0" vb-fs="fs-sm" vb-fw="700" vb-color="cl-ink">
        {{ getMovieYear(movie) }} • ★ {{ getMovieRating(movie) }}
      </p>

      <div vb-display="flex" vb-gap="sp-3" vb-mt="sp-2">
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
          size="sm"
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
