<script setup lang="ts">
import type { TmdbMovie } from '../types/tmdb';
import MovieCard from './MovieCard.vue';

defineProps<{
  title: string;
  movies: TmdbMovie[];
  loading?: boolean;
}>();
</script>

<template>
  <section aria-label="Movie row" vb-display="grid" vb-gap="sp-4">
    <h2 vb-m="0" vb-fs="fs-xl" vb-color="cl-ink">{{ title }}</h2>

    <p
      v-if="loading"
      vb-m="0"
      vb-color="color-mix(in oklab, var(--color-ink) 75%, transparent)"
    >
      Loading {{ title.toLowerCase() }}...
    </p>

    <div
      v-else
      class="movie-row-track"
      vb-display="grid"
      vb-grid-template-columns="repeat(auto-fill,minmax(14.5rem,1fr))"
      vb-gap="sp-4"
    >
      <MovieCard
        v-for="movie in movies.slice(0, 10)"
        :key="movie.id"
        :movie="movie"
      />
    </div>
  </section>
</template>
