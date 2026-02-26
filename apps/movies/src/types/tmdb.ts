export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
}

export interface TmdbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbGenreResponse {
  genres: TmdbGenre[];
}

export interface TmdbMovieDetails extends TmdbMovie {
  runtime: number | null;
  genres: TmdbGenre[];
  homepage: string | null;
  status: string;
  tagline: string | null;
}

export interface TmdbMovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  iso_639_1: string | null;
  iso_3166_1: string | null;
  published_at: string;
}

export interface TmdbMovieVideoResponse {
  id: number;
  results: TmdbMovieVideo[];
}
