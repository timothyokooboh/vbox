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
  <v-box>
    <section
      ref="heroRef"
      position="relative"
      min-h="60vh"
      display="grid"
      align-items="end"
      p="sp-5"
      :sm="{ p: 'sp-8' }"
      border-radius="br-card"
      overflow="hidden"
      border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
      shadow="bs-card"
      :style="{
        backgroundImage: `linear-gradient(to top, color-mix(in oklab, var(--color-canvas) 92%, transparent), color-mix(in oklab, var(--color-canvas) 24%, transparent)), url(${backdrop})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <div ref="contentRef" display="grid" gap="sp-3" max-w="42rem">
        <p
          m="0"
          fs="fs-sm"
          fw="700"
          ls="0.1em"
          text-transform="uppercase"
          color="cl-accent"
        >
          Featured Tonight
        </p>

        <h1 m="0" fs="clamp(2rem,6vw,4rem)" lh="1.02" color="cl-ink">
          {{ movie?.title ?? 'Discover your next obsession' }}
        </h1>

        <p
          m="0"
          fs="fs-base"
          color="color-mix(in oklab, var(--color-ink) 86%, transparent)"
        >
          {{
            movie?.overview ??
            'Set your TMDB key to unlock live recommendations.'
          }}
        </p>

        <p v-if="movie" m="0" fs="fs-sm" fw="700" color="cl-ink">
          {{ getMovieYear(movie) }} • ★ {{ getMovieRating(movie) }}
        </p>

        <div display="flex" gap="sp-3" mt="sp-2">
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
            vbox
            color="yellow"
          >
            View Details
          </AppButton>

          <AppButton
            as="a"
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer noopener"
            variant="outline"
          >
            TMDB Attribution
          </AppButton>
        </div>
      </div>
    </section>
  </v-box>
</template>
