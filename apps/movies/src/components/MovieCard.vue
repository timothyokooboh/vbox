<script setup lang="ts">
import { useMotionPreferences } from '../composables/useMotionPreferences';
import { computed } from 'vue';
import { getPosterUrl } from '../api/tmdb';
import {
  getMovieRating,
  getMovieYear,
} from '../composables/useMovieFormatting';
import { movieMetadataStyles } from './movieStyles';
import type { TmdbMovie } from '../types/tmdb';

const { allowViewTransition } = useMotionPreferences();

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
    vb-pos="relative"
    vb-border-radius="br-card"
    vb-overflow="hidden"
    vb-bg="var(--color-canvas-soft)"
    vb-border="1px solid color-mix(in oklab, var(--color-ink) 10%, transparent)"
    vb-transition="transform 180ms ease"
    :vb-mq="{
      '@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)':
        {
          hover: { transform: 'translateY(-4px) scale(1.025)', zIndex: 1 },
        },
    }"
  >
    <router-link
      :view-transition="allowViewTransition"
      :to="`/movie/${movie.id}`"
      vb-text-decoration="none"
      vb-color="inherit"
      vb-display="block"
      :vb-focus-visible="{
        outline: '3px solid cl-ring',
        outlineOffset: '-4px',
      }"
      @click="emit('select')"
    >
      <img
        :src="
          posterSrc ||
          'https://placehold.co/480x720/111827/FFFFFF?text=VBox+Movies'
        "
        :alt="`Poster for ${movie.title}`"
        vb-w="100%"
        vb-aspect-ratio="2 / 3"
        vb-h="auto"
        vb-display="block"
        vb-object-fit="cover"
        loading="lazy"
      />

      <div :vb="movieMetadataStyles">
        <h3
          vb-m="0"
          vb-fs="fs-base"
          vb-color="cl-ink"
          vb-lh="1.4"
          vb-overflow-wrap="anywhere"
        >
          {{ movie.title }}
        </h3>
        <p vb-m="0" vb-fs="fs-sm" vb-color="cl-muted">
          {{ getMovieYear(movie) }} • ★ {{ getMovieRating(movie) }}
        </p>
      </div>
    </router-link>
  </article>
</template>
