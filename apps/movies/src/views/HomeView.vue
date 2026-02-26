<script setup lang="ts">
import { computed } from 'vue';
import HeroBanner from '../components/HeroBanner.vue';
import MovieRow from '../components/MovieRow.vue';
import {
  useNowPlayingMoviesQuery,
  usePopularMoviesQuery,
  useTopRatedMoviesQuery,
  useTrendingMoviesQuery,
} from '../composables/useTmdbQueries';

const trendingQuery = useTrendingMoviesQuery();
const popularQuery = usePopularMoviesQuery();
const topRatedQuery = useTopRatedMoviesQuery();
const nowPlayingQuery = useNowPlayingMoviesQuery();

const featuredMovie = computed(
  () => trendingQuery.data.value?.results?.[0] ?? null,
);
</script>

<template>
  <main display="grid" gap="sp-8" p="sp-4" :sm="{ p: 'sp-6' }" role="main">
    <HeroBanner :movie="featuredMovie" />

    <MovieRow
      title="Trending This Week"
      :movies="trendingQuery.data.value?.results ?? []"
      :loading="trendingQuery.isLoading.value"
    />

    <MovieRow
      title="Popular"
      :movies="popularQuery.data.value?.results ?? []"
      :loading="popularQuery.isLoading.value"
    />

    <MovieRow
      title="Top Rated"
      :movies="topRatedQuery.data.value?.results ?? []"
      :loading="topRatedQuery.isLoading.value"
    />

    <MovieRow
      title="Now Playing"
      :movies="nowPlayingQuery.data.value?.results ?? []"
      :loading="nowPlayingQuery.isLoading.value"
    />
  </main>
</template>
