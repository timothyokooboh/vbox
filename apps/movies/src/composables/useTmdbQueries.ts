import { computed, unref, type MaybeRef } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { tmdbApi } from '../api/tmdb';

export const useTrendingMoviesQuery = () =>
  useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: tmdbApi.getTrendingMovies,
    staleTime: 60_000
  });

export const usePopularMoviesQuery = () =>
  useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: tmdbApi.getPopularMovies,
    staleTime: 60_000
  });

export const useTopRatedMoviesQuery = () =>
  useQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: tmdbApi.getTopRatedMovies,
    staleTime: 60_000
  });

export const useNowPlayingMoviesQuery = () =>
  useQuery({
    queryKey: ['movies', 'now-playing'],
    queryFn: tmdbApi.getNowPlayingMovies,
    staleTime: 60_000
  });

export const useMovieDetailsQuery = (movieId: MaybeRef<number>) =>
  useQuery({
    queryKey: computed(() => ['movie', unref(movieId)]),
    queryFn: () => tmdbApi.getMovieById(unref(movieId)),
    enabled: computed(() => Number.isFinite(unref(movieId)))
  });

export const useMovieSearchQuery = (searchTerm: MaybeRef<string>) =>
  useQuery({
    queryKey: computed(() => ['movies', 'search', unref(searchTerm)]),
    queryFn: () => tmdbApi.searchMovies(unref(searchTerm)),
    enabled: computed(() => unref(searchTerm).trim().length > 0)
  });

export const useMovieVideosQuery = (
  movieId: MaybeRef<number>,
  enabled: MaybeRef<boolean> = true
) =>
  useQuery({
    queryKey: computed(() => ['movie', unref(movieId), 'videos']),
    queryFn: () => tmdbApi.getMovieVideos(unref(movieId)),
    enabled: computed(
      () => Number.isFinite(unref(movieId)) && unref(movieId) > 0 && Boolean(unref(enabled))
    )
  });
