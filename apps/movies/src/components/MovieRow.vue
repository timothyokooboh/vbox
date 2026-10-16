<script setup lang="ts">
import type { TmdbMovie } from '../types/tmdb';
import AppSkeleton from './AppSkeleton.vue';
import MovieCard from './MovieCard.vue';

defineProps<{
  title: string;
  movies: TmdbMovie[];
  loading?: boolean;
  error?: boolean;
}>();
</script>

<template>
  <section :aria-label="title" vb-display="grid" vb-gap="sp-4">
    <h2 vb-m="0" vb-fs="fs-xl" vb-fw="800" vb-ls="-0.03em" vb-color="cl-ink">
      {{ title }}
    </h2>

    <div
      v-if="loading"
      role="status"
      :aria-label="`Loading ${title.toLowerCase()}`"
      aria-busy="true"
      vb-display="grid"
      vb-grid-template-columns="repeat(2, minmax(0, 1fr))"
      :vb-sm="{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }"
      :vb-lg="{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }"
      vb-gap="sp-4"
    >
      <AppSkeleton
        v-for="placeholder in 5"
        :key="placeholder"
        vb-aspect-ratio="2 / 3"
        vb-h="auto"
        vb-border-radius="br-card"
      />
    </div>
    <p
      v-else-if="error || !movies.length"
      role="status"
      vb-m="0"
      vb-p="sp-6"
      vb-bg="cl-canvas-soft"
      vb-border-radius="br-card"
      vb-color="cl-muted"
    >
      {{
        error
          ? 'Unable to load these titles. Please try again later.'
          : 'No titles available right now.'
      }}
    </p>

    <div
      v-else
      vb-display="grid"
      vb-grid-template-columns="repeat(2, minmax(0, 1fr))"
      :vb-sm="{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }"
      :vb-lg="{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }"
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
