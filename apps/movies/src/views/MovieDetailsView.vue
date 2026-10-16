<script setup lang="ts">
import { useMotionPreferences } from '../composables/useMotionPreferences';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { getBackdropUrl, getPosterUrl } from '../api/tmdb';
import {
  getMovieRating,
  getMovieYear,
} from '../composables/useMovieFormatting';
import { useMovieDetailsQuery } from '../composables/useTmdbQueries';
import AppSkeleton from '../components/AppSkeleton.vue';
import MovieTrailerDialog from '../components/MovieTrailerDialog.vue';

const { allowViewTransition } = useMotionPreferences();

const route = useRoute();
const movieId = computed(() => Number(route.params.id));
const detailsQuery = useMovieDetailsQuery(movieId);

const movie = computed(() => detailsQuery.data.value ?? null);
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
    vb-max-w="100rem"
    vb-mx="auto"
    vb-outline="none"
    vb-p="sp-4"
    :vb-sm="{ p: 'sp-6' }"
    :vb-lg="{ px: 'sp-10' }"
  >
    <router-link
      :view-transition="allowViewTransition"
      to="/"
      vb-color="cl-accent"
      vb-text-decoration="none"
      vb-fw="700"
      vb-display="inline-block"
      vb-mb="sp-5"
    >
      ← Back to Home
    </router-link>

    <section
      v-if="movie"
      vb-display="grid"
      :vb-md="{
        gridTemplateColumns: '18rem 1fr',
      }"
      vb-gap="sp-5"
      vb-p="sp-4"
      vb-bg="var(--color-canvas-soft)"
      vb-border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
      vb-border-radius="br-card"
    >
      <img
        :src="
          getPosterUrl(movie.poster_path) ||
          'https://placehold.co/480x720/111827/FFFFFF?text=Poster'
        "
        :alt="`Poster for ${movie.title}`"
        vb-w="100%"
        vb-max-w="18rem"
        vb-aspect-ratio="2 / 3"
        vb-object-fit="cover"
        vb-border-radius="br-card"
      />

      <div vb-display="grid" vb-gap="sp-3">
        <h1 vb-m="0" vb-fs="clamp(1.8rem,4.2vw,3rem)" vb-color="cl-ink">
          {{ movie.title }}
        </h1>
        <p v-if="movie.tagline" vb-m="0" vb-fs="fs-lg" vb-color="cl-accent">
          {{ movie.tagline }}
        </p>
        <p
          vb-m="0"
          vb-color="color-mix(in oklab, var(--color-ink) 82%, transparent)"
        >
          {{ movie.overview }}
        </p>
        <p vb-m="0" vb-color="cl-ink" vb-fw="700">
          {{ getMovieYear(movie) }} • ★ {{ getMovieRating(movie) }} •
          {{ movie.runtime ?? 'N/A' }} min
        </p>
        <div>
          <MovieTrailerDialog
            :movie-id="movie.id"
            :movie-title="movie.title"
            button-label="Watch Trailer"
          />
        </div>
        <p vb-m="0" vb-color="cl-ink">Status: {{ movie.status }}</p>

        <div vb-display="flex" vb-flex-wrap="wrap" vb-gap="sp-2" vb-mt="sp-2">
          <p
            v-for="genre in movie.genres"
            :key="genre.id"
            vb-px="sp-3"
            vb-py="sp-2"
            vb-border-radius="br-pill"
            vb-bg="color-mix(in oklab, var(--color-brand) 22%, transparent)"
            vb-color="cl-ink"
            vb-flex-grow="0"
            vb-display="flex"
            vb-justify-content="center"
            vb-align-items="center"
            vb-height="40px"
          >
            {{ genre.name }}
          </p>
        </div>

        <img
          v-if="movie.backdrop_path"
          :src="getBackdropUrl(movie.backdrop_path, 'w1280')"
          :alt="`Backdrop image for ${movie.title}`"
          vb-w="100%"
          vb-aspect-ratio="16 / 9"
          vb-h="auto"
          vb-object-fit="cover"
          vb-object-position="center top"
          vb-border-radius="br-card"
          vb-mt="sp-3"
        />
      </div>
    </section>

    <section
      v-else-if="detailsQuery.isLoading.value"
      vb-display="grid"
      :vb-md="{ gridTemplateColumns: '18rem 1fr' }"
      vb-gap="sp-5"
      vb-p="sp-4"
      vb-bg="var(--color-canvas-soft)"
      vb-border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
      vb-border-radius="br-card"
      role="status"
      aria-label="Loading movie details"
      aria-busy="true"
      aria-live="polite"
    >
      <AppSkeleton
        vb-w="100%"
        vb-max-w="18rem"
        vb-h="26rem"
        vb-border-radius="br-card"
      />

      <div vb-display="grid" vb-gap="sp-3">
        <AppSkeleton vb-h="2.75rem" vb-w="70%" vb-border-radius="0.75rem" />
        <AppSkeleton vb-h="1.35rem" vb-w="40%" vb-border-radius="0.75rem" />
        <AppSkeleton vb-h="1rem" vb-w="96%" vb-border-radius="0.5rem" />
        <AppSkeleton vb-h="1rem" vb-w="92%" vb-border-radius="0.5rem" />
        <AppSkeleton vb-h="1rem" vb-w="80%" vb-border-radius="0.5rem" />
        <AppSkeleton vb-h="1rem" vb-w="50%" vb-border-radius="0.5rem" />

        <div vb-display="flex" vb-flex-wrap="wrap" vb-gap="sp-2" vb-mt="sp-2">
          <AppSkeleton vb-h="2rem" vb-w="5rem" vb-border-radius="999px" />
          <AppSkeleton vb-h="2rem" vb-w="6rem" vb-border-radius="999px" />
          <AppSkeleton vb-h="2rem" vb-w="4.5rem" vb-border-radius="999px" />
        </div>

        <AppSkeleton
          vb-w="100%"
          vb-aspect-ratio="16 / 9"
          vb-h="auto"
          vb-border-radius="br-card"
          vb-mt="sp-3"
        />
      </div>
    </section>
    <section
      v-else
      role="status"
      vb-bg="cl-canvas-soft"
      vb-border-radius="br-panel"
      vb-p="sp-8"
      vb-border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
    >
      <h1 vb-m="0" vb-fs="fs-2xl">Movie details unavailable.</h1>
      <p vb-mb="0" vb-color="cl-muted" vb-lh="1.6">
        We couldn't load this title. Head back home to find something else to
        watch.
      </p>
    </section>
  </main>
</template>
