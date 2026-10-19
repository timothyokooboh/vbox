<script setup lang="ts">
import type { TmdbMovie } from '../types/tmdb';
import AppSkeleton from './AppSkeleton.vue';
import MovieCard from './MovieCard.vue';
import { movieGridStyles, movieMetadataStyles } from './movieStyles';

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
      v-if="loading && !movies.length"
      role="status"
      :aria-label="`Loading ${title.toLowerCase()}`"
      aria-busy="true"
      :vb="movieGridStyles"
    >
      <div
        v-for="placeholder in 10"
        :key="placeholder"
        aria-hidden="true"
        vb-border-radius="br-card"
        vb-overflow="hidden"
        vb-border="1px solid color-mix(in oklab, var(--color-ink) 10%, transparent)"
      >
        <AppSkeleton vb-aspect-ratio="2 / 3" vb-h="auto" vb-border-radius="0" />
        <div :vb="movieMetadataStyles">
          <AppSkeleton vb-width="80%" vb-height="1rem" />
          <AppSkeleton vb-width="50%" vb-height="0.75rem" />
        </div>
      </div>
    </div>
    <p
      v-else-if="!movies.length"
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

    <p v-if="error && movies.length" role="status" vb-m="0" vb-color="cl-muted">
      Could not refresh these titles. Showing saved results.
    </p>
    <div v-if="movies.length" :vb="movieGridStyles">
      <MovieCard
        v-for="movie in movies.slice(0, 10)"
        :key="movie.id"
        :movie="movie"
      />
    </div>
  </section>
</template>
