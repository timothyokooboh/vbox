import { describe, expect, it } from 'vitest';
import { getBackdropUrl, getPosterUrl } from '../tmdb';

describe('tmdb helpers', () => {
  it('builds poster urls', () => {
    expect(getPosterUrl('/abc.jpg')).toContain('/w500/abc.jpg');
  });

  it('builds backdrop urls', () => {
    expect(getBackdropUrl('/abc.jpg', 'w780')).toContain('/w780/abc.jpg');
  });

  it('returns empty when image path missing', () => {
    expect(getPosterUrl(null)).toBe('');
    expect(getBackdropUrl(null)).toBe('');
  });
});
