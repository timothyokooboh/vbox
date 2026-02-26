import type { TmdbMovie } from '../types/tmdb';

export const getMovieYear = (movie: Pick<TmdbMovie, 'release_date'>) =>
  movie.release_date ? new Date(movie.release_date).getFullYear().toString() : 'N/A';

export const getMovieRating = (movie: Pick<TmdbMovie, 'vote_average'>) =>
  Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : '0.0';
