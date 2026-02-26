import type {
  TmdbGenreResponse,
  TmdbMovie,
  TmdbMovieDetails,
  TmdbMovieVideoResponse,
  TmdbResponse
} from '../types/tmdb';
import { mockMovies } from './mockData';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const apiKey = import.meta.env.VITE_TMDB_API_KEY;

const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0);

const buildUrl = (path: string, params: Record<string, string> = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${path}`);

  if (hasApiKey) {
    url.searchParams.set('api_key', apiKey as string);
  }

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

const fetchJson = async <T>(path: string, params: Record<string, string> = {}) => {
  if (!hasApiKey) {
    return null;
  }

  const response = await fetch(buildUrl(path, params));
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getPosterUrl = (posterPath: string | null, size: 'w300' | 'w500' = 'w500') => {
  if (!posterPath) return '';
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
};

export const getBackdropUrl = (
  backdropPath: string | null,
  size: 'w780' | 'w1280' | 'original' = 'w1280'
) => {
  if (!backdropPath) return '';
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
};

const buildMockList = (): TmdbResponse<TmdbMovie> => ({
  page: 1,
  total_pages: 1,
  total_results: mockMovies.length,
  results: mockMovies
});

export const tmdbApi = {
  hasApiKey,
  buildUrl,
  async getTrendingMovies() {
    return (await fetchJson<TmdbResponse<TmdbMovie>>('/trending/movie/week')) ?? buildMockList();
  },
  async getPopularMovies() {
    return (
      (await fetchJson<TmdbResponse<TmdbMovie>>('/movie/popular', {
        include_adult: 'false'
      })) ?? buildMockList()
    );
  },
  async getTopRatedMovies() {
    return (await fetchJson<TmdbResponse<TmdbMovie>>('/movie/top_rated')) ?? buildMockList();
  },
  async getNowPlayingMovies() {
    return (await fetchJson<TmdbResponse<TmdbMovie>>('/movie/now_playing')) ?? buildMockList();
  },
  async searchMovies(query: string) {
    if (!query.trim()) return buildMockList();
    return (
      (await fetchJson<TmdbResponse<TmdbMovie>>('/search/movie', {
        query,
        include_adult: 'false'
      })) ?? {
        ...buildMockList(),
        results: mockMovies.filter((movie) =>
          movie.title.toLowerCase().includes(query.toLowerCase())
        )
      }
    );
  },
  async getMovieById(id: number) {
    const fallbackMovie = mockMovies[0]!;
    return (
      (await fetchJson<TmdbMovieDetails>(`/movie/${id}`)) ?? {
        ...fallbackMovie,
        id,
        runtime: 126,
        genres: [
          { id: 28, name: 'Action' },
          { id: 878, name: 'Sci-Fi' }
        ],
        homepage: null,
        status: 'Released',
        tagline: 'Silence has coordinates.'
      }
    );
  },
  async getGenres() {
    return (
      (await fetchJson<TmdbGenreResponse>('/genre/movie/list')) ?? {
        genres: [
          { id: 28, name: 'Action' },
          { id: 878, name: 'Sci-Fi' },
          { id: 53, name: 'Thriller' },
          { id: 18, name: 'Drama' }
        ]
      }
    );
  },
  async getMovieVideos(id: number) {
    return (
      (await fetchJson<TmdbMovieVideoResponse>(`/movie/${id}/videos`)) ?? {
        id,
        results: []
      }
    );
  }
};
