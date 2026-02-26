import { describe, expect, it } from 'vitest';
import {
  getTrailerEmbedUrl,
  selectPreferredTrailer
} from '../useMovieTrailer';
import type { TmdbMovieVideo } from '../../types/tmdb';

const video = (overrides: Partial<TmdbMovieVideo>): TmdbMovieVideo => ({
  id: overrides.id ?? `id-${Math.random().toString(16).slice(2)}`,
  key: overrides.key ?? 'abc123',
  name: overrides.name ?? 'Trailer',
  site: overrides.site ?? 'YouTube',
  type: overrides.type ?? 'Trailer',
  official: overrides.official ?? false,
  iso_639_1: overrides.iso_639_1 ?? 'en',
  iso_3166_1: overrides.iso_3166_1 ?? 'US',
  published_at: overrides.published_at ?? '2023-09-09T00:00:00.000Z'
});

describe('selectPreferredTrailer', () => {
  it('prefers official YouTube trailers over others', () => {
    const picked = selectPreferredTrailer([
      video({ site: 'Vimeo', type: 'Trailer', official: true }),
      video({ site: 'YouTube', type: 'Teaser', official: false }),
      video({ site: 'YouTube', type: 'Trailer', official: true })
    ]);

    expect(picked?.site).toBe('YouTube');
    expect(picked?.type).toBe('Trailer');
    expect(picked?.official).toBe(true);
  });

  it('falls back to newest item when scores are tied', () => {
    const older = video({
      published_at: '2022-01-01T00:00:00.000Z'
    });
    const newer = video({
      published_at: '2024-01-01T00:00:00.000Z'
    });

    const picked = selectPreferredTrailer([older, newer]);
    expect(picked?.published_at).toBe(newer.published_at);
  });

  it('returns null when no valid videos are provided', () => {
    expect(selectPreferredTrailer([])).toBeNull();
    expect(selectPreferredTrailer(undefined)).toBeNull();
    expect(selectPreferredTrailer([video({ key: '' })])).toBeNull();
  });
});

describe('getTrailerEmbedUrl', () => {
  it('builds youtube nocookie embed urls', () => {
    const url = getTrailerEmbedUrl({ site: 'YouTube', key: 'xyz' });
    expect(url).toContain('youtube-nocookie.com/embed/xyz');
    expect(url).toContain('autoplay=1');
  });

  it('builds vimeo embed urls', () => {
    const url = getTrailerEmbedUrl({ site: 'Vimeo', key: '12345' });
    expect(url).toBe('https://player.vimeo.com/video/12345?autoplay=1');
  });

  it('returns null for unsupported sites or missing key', () => {
    expect(getTrailerEmbedUrl({ site: 'Dailymotion', key: '1' })).toBeNull();
    expect(getTrailerEmbedUrl({ site: 'YouTube', key: '' })).toBeNull();
    expect(getTrailerEmbedUrl(null)).toBeNull();
  });
});
