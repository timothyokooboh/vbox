<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { getBackdropUrl, getPosterUrl } from '../api/tmdb';
import {
  getMovieRating,
  getMovieYear,
} from '../composables/useMovieFormatting';
import { useMovieDetailsQuery } from '../composables/useTmdbQueries';
import MovieTrailerDialog from '../components/MovieTrailerDialog.vue';

const route = useRoute();
const movieId = computed(() => Number(route.params.id));
const detailsQuery = useMovieDetailsQuery(movieId);

const movie = computed(() => detailsQuery.data.value ?? null);
</script>

<template>
  <main p="sp-4" :sm="{ p: 'sp-6' }">
    <router-link
      to="/"
      color="cl-accent"
      text-decoration="none"
      fw="700"
      display="inline-block"
      mb="sp-5"
    >
      ← Back to Home
    </router-link>

    <section
      v-if="movie"
      display="grid"
      :md="{
        gridTemplateColumns: '18rem 1fr',
      }"
      gap="sp-5"
      p="sp-4"
      bg="var(--color-canvas-soft)"
      border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
      border-radius="br-card"
    >
      <img
        :src="
          getPosterUrl(movie.poster_path) ||
          'https://placehold.co/480x720/111827/FFFFFF?text=Poster'
        "
        :alt="`Poster for ${movie.title}`"
        w="100%"
        max-w="18rem"
        h="auto"
        border-radius="br-card"
      />

      <div display="grid" gap="sp-3">
        <h1 m="0" fs="clamp(1.8rem,4.2vw,3rem)" color="cl-ink">
          {{ movie.title }}
        </h1>
        <p v-if="movie.tagline" m="0" fs="fs-lg" color="cl-accent">
          {{ movie.tagline }}
        </p>
        <p m="0" color="color-mix(in oklab, var(--color-ink) 82%, transparent)">
          {{ movie.overview }}
        </p>
        <p m="0" color="cl-ink" fw="700">
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
        <p m="0" color="cl-ink">Status: {{ movie.status }}</p>

        <div display="flex" flex-wrap="wrap" gap="sp-2" mt="sp-2">
          <p
            v-for="genre in movie.genres"
            :key="genre.id"
            px="sp-3"
            py="sp-2"
            border-radius="br-pill"
            bg="color-mix(in oklab, var(--color-brand) 22%, transparent)"
            color="cl-ink"
            flex-grow="0"
            display="flex"
            justify-content="center"
            align-items="center"
            height="40px"
          >
            {{ genre.name }}
          </p>
        </div>

        <img
          v-if="movie.backdrop_path"
          :src="getBackdropUrl(movie.backdrop_path, 'w1280')"
          :alt="`Backdrop image for ${movie.title}`"
          w="100%"
          h="38rem"
          object-fit="cover"
          object-position="center top"
          border-radius="br-card"
          mt="sp-3"
        />
      </div>
    </section>

    <section
      v-else-if="detailsQuery.isLoading.value"
      display="grid"
      :md="{ gridTemplateColumns: '18rem 1fr' }"
      gap="sp-5"
      p="sp-4"
      bg="var(--color-canvas-soft)"
      border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
      border-radius="br-card"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        class="movie-skeleton"
        w="100%"
        max-w="18rem"
        h="26rem"
        border-radius="br-card"
      />

      <div display="grid" gap="sp-3">
        <div
          class="movie-skeleton"
          h="2.75rem"
          w="70%"
          border-radius="0.75rem"
        />
        <div
          class="movie-skeleton"
          h="1.35rem"
          w="40%"
          border-radius="0.75rem"
        />
        <div class="movie-skeleton" h="1rem" w="96%" border-radius="0.5rem" />
        <div class="movie-skeleton" h="1rem" w="92%" border-radius="0.5rem" />
        <div class="movie-skeleton" h="1rem" w="80%" border-radius="0.5rem" />
        <div class="movie-skeleton" h="1rem" w="50%" border-radius="0.5rem" />

        <div display="flex" flex-wrap="wrap" gap="sp-2" mt="sp-2">
          <div class="movie-skeleton" h="2rem" w="5rem" border-radius="999px" />
          <div class="movie-skeleton" h="2rem" w="6rem" border-radius="999px" />
          <div
            class="movie-skeleton"
            h="2rem"
            w="4.5rem"
            border-radius="999px"
          />
        </div>

        <div
          class="movie-skeleton"
          w="100%"
          h="38rem"
          border-radius="br-card"
          mt="sp-3"
        />
      </div>
    </section>
    <p v-else color="cl-ink">Movie details unavailable.</p>
  </main>
</template>

<style scoped>
.movie-skeleton {
  background: linear-gradient(
    100deg,
    color-mix(in oklab, var(--color-ink) 8%, transparent) 20%,
    color-mix(in oklab, var(--color-ink) 16%, transparent) 35%,
    color-mix(in oklab, var(--color-ink) 8%, transparent) 50%
  );
  background-size: 200% 100%;
  animation: movie-skeleton-shimmer 1.2s linear infinite;
}

@keyframes movie-skeleton-shimmer {
  0% {
    background-position: 150% 0;
  }
  100% {
    background-position: -150% 0;
  }
}
</style>
