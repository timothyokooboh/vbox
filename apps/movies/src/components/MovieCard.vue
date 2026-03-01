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
    pos="relative"
    border-radius="br-card"
    overflow="hidden"
    bg="var(--color-canvas-soft)"
    border="1px solid color-mix(in oklab, var(--color-ink) 10%, transparent)"
    shadow="bs-glow"
    transition="transform 420ms cubic-bezier(0.22, 0.85, 0.24, 1), box-shadow 420ms ease, filter 420ms ease, opacity 420ms ease"
  >
    <router-link
      class="movie-card__link"
      :to="`/movie/${movie.id}`"
      text-decoration="none"
      color="inherit"
      display="block"
      @click="emit('select')"
    >
      <img
        class="movie-card__image"
        :src="
          posterSrc ||
          'https://placehold.co/480x720/111827/FFFFFF?text=VBox+Movies'
        "
        :alt="`Poster for ${movie.title}`"
        w="100%"
        h="16rem"
        object-fit="cover"
        loading="lazy"
      />

      <div class="movie-card__content" p="sp-3" display="grid" gap="sp-1">
        <h3 m="0" fs="fs-base" color="cl-ink">{{ movie.title }}</h3>
        <p
          m="0"
          fs="fs-sm"
          color="color-mix(in oklab, var(--color-ink) 75%, transparent)"
        >
          {{ getMovieYear(movie) }} • ★ {{ getMovieRating(movie) }}
        </p>
      </div>
    </router-link>
  </article>
</template>
