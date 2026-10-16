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
  <main
    id="main-content"
    tabindex="-1"
    vb-max-w="100rem"
    vb-mx="auto"
    vb-outline="none"
    vb-display="grid"
    vb-gap="sp-10"
    vb-p="sp-4"
    :vb-sm="{ p: 'sp-6' }"
    :vb-lg="{ px: 'sp-10' }"
    role="main"
  >
    <HeroBanner :movie="featuredMovie" />

    <MovieRow
      title="Trending This Week"
      :movies="trendingQuery.data.value?.results ?? []"
      :loading="trendingQuery.isLoading.value"
      :error="trendingQuery.isError.value"
    />

    <MovieRow
      title="Popular"
      :movies="popularQuery.data.value?.results ?? []"
      :loading="popularQuery.isLoading.value"
      :error="popularQuery.isError.value"
    />

    <MovieRow
      title="Top Rated"
      :movies="topRatedQuery.data.value?.results ?? []"
      :loading="topRatedQuery.isLoading.value"
      :error="topRatedQuery.isError.value"
    />

    <MovieRow
      title="Now Playing"
      :movies="nowPlayingQuery.data.value?.results ?? []"
      :loading="nowPlayingQuery.isLoading.value"
      :error="nowPlayingQuery.isError.value"
    />
  </main>
</template>
