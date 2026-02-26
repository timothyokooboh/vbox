import type { TmdbMovie } from '../types/tmdb';

export const mockMovies: TmdbMovie[] = [
  {
    id: 1,
    title: 'Neon Dawn',
    overview:
      'A disgraced pilot uncovers a conspiracy hidden inside a city-wide AI transport grid.',
    poster_path: '/xgDj56UWyeWQcxQ44f5A3RTWuSs.jpg',
    backdrop_path: '/3xkij5J3qR0hT3y6LwLQzKq9v8v.jpg',
    release_date: '2024-11-13',
    vote_average: 7.9,
    vote_count: 1432,
    genre_ids: [28, 878],
    original_language: 'en',
    adult: false
  },
  {
    id: 2,
    title: 'Velvet District',
    overview:
      'An investigative journalist and a retired detective chase clues across an electric nightlife capital.',
    poster_path: '/r8A8f4L5VQf8jYk4R52QfM6KQHe.jpg',
    backdrop_path: '/vIgyYkXkg6NC49Yf7e3qF4iAfD8.jpg',
    release_date: '2025-02-02',
    vote_average: 8.2,
    vote_count: 879,
    genre_ids: [80, 53],
    original_language: 'en',
    adult: false
  },
  {
    id: 3,
    title: 'Atlas of Silence',
    overview:
      'A deep-sea mapper discovers an abandoned station that broadcasts impossible coordinates.',
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop_path: '/A89A5S1A7v6l7fXw4zk2A3P8z1W.jpg',
    release_date: '2025-07-16',
    vote_average: 7.5,
    vote_count: 640,
    genre_ids: [12, 9648],
    original_language: 'en',
    adult: false
  }
];
