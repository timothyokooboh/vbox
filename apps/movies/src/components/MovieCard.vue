<script setup lang="ts">
import { computed } from 'vue';
import { getPosterUrl } from '../api/tmdb';
import {
  getMovieRating,
  getMovieYear,
} from '../composables/useMovieFormatting';
import type { TmdbMovie } from '../types/tmdb';

const props = defineProps<{
  movie: TmdbMovie;
}>();
const emit = defineEmits<{
  (event: 'select'): void;
}>();

const posterSrc = computed(() => getPosterUrl(props.movie.poster_path));
</script>

<template>
  <article
    class="movie-card"
    vb-pos="relative"
    vb-border-radius="br-card"
    vb-overflow="hidden"
    vb-bg="var(--color-canvas-soft)"
    vb-border="1px solid color-mix(in oklab, var(--color-ink) 10%, transparent)"
    vb-shadow="bs-glow"
    vb-transition="transform 420ms cubic-bezier(0.22, 0.85, 0.24, 1), box-shadow 420ms ease, filter 420ms ease, opacity 420ms ease"
  >
    <router-link
      class="movie-card__link"
      :to="`/movie/${movie.id}`"
      vb-text-decoration="none"
      vb-color="inherit"
      vb-display="block"
      @click="emit('select')"
    >
      <img
        class="movie-card__image"
        :src="
          posterSrc ||
          'https://placehold.co/480x720/111827/FFFFFF?text=VBox+Movies'
        "
        :alt="`Poster for ${movie.title}`"
        vb-w="100%"
        vb-h="16rem"
        vb-object-fit="cover"
        loading="lazy"
      />

      <div
        class="movie-card__content"
        vb-p="sp-3"
        vb-display="grid"
        vb-gap="sp-1"
      >
        <h3 vb-m="0" vb-fs="fs-base" vb-color="cl-ink">{{ movie.title }}</h3>
        <p
          vb-m="0"
          vb-fs="fs-sm"
          vb-color="color-mix(in oklab, var(--color-ink) 75%, transparent)"
        >
          {{ getMovieYear(movie) }} • ★ {{ getMovieRating(movie) }}
        </p>
      </div>
    </router-link>
  </article>
</template>
