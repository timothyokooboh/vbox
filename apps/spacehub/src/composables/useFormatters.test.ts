import { describe, expect, it } from 'vitest';
import { formatDistanceKm, formatVelocity } from './useFormatters';

describe('useFormatters', () => {
  it('formats distance in km', () => {
    expect(formatDistanceKm('12345.56')).toContain('12,346');
  });

  it('formats velocity in km/h', () => {
    expect(formatVelocity('98765.4')).toContain('98,765');
  });
});
