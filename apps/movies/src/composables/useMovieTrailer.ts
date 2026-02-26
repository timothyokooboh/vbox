import { computed, unref, type MaybeRef } from 'vue';
import type { TmdbMovieVideo } from '../types/tmdb';

const SITE_PRIORITY: Record<string, number> = {
  YouTube: 4,
  Vimeo: 3
};

const TYPE_PRIORITY: Record<string, number> = {
  Trailer: 4,
  Teaser: 3,
  Clip: 2,
  Featurette: 1
};

const getVideoScore = (video: TmdbMovieVideo): number => {
  let score = 0;

  score += (SITE_PRIORITY[video.site] ?? 0) * 100;
  score += (TYPE_PRIORITY[video.type] ?? 0) * 25;
  score += video.official ? 15 : 0;
  score += video.iso_639_1 === 'en' ? 5 : 0;

  const title = video.name.toLowerCase();
  if (title.includes('official trailer')) score += 10;
  else if (title.includes('trailer')) score += 5;

  return score;
};

export const selectPreferredTrailer = (
  videos: readonly TmdbMovieVideo[] | null | undefined,
): TmdbMovieVideo | null => {
  if (!videos?.length) return null;

  const ranked = videos
    .filter((video) => Boolean(video.key))
    .sort((a, b) => {
      const scoreDiff = getVideoScore(b) - getVideoScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

  return ranked[0] ?? null;
};

export const getTrailerEmbedUrl = (
  trailer: Pick<TmdbMovieVideo, 'site' | 'key'> | null,
): string | null => {
  if (!trailer?.key) return null;

  if (trailer.site === 'YouTube') {
    return `https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`;
  }

  if (trailer.site === 'Vimeo') {
    return `https://player.vimeo.com/video/${trailer.key}?autoplay=1`;
  }

  return null;
};

export const usePreferredTrailer = (videos: MaybeRef<TmdbMovieVideo[] | undefined>) =>
  computed(() => selectPreferredTrailer(unref(videos)));
