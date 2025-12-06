import { describe, test, vi, expect, beforeEach } from 'vitest';
import { keyframes } from '../src/helpers/keyframes';

describe('keyframes', () => {
  beforeEach(() => {
    document.head.innerHTML = '';

    if (!globalThis.CSS) {
      globalThis.CSS = {
        supports: vi.fn(),
      } as any;
    }
  });

  test('generates a stable hashed name when no name is provided', () => {
    const fade = keyframes({
      from: { opacity: '0' },
      to: { opacity: '1' },
    });

    const fade2 = keyframes({
      from: { opacity: '0' },
      to: { opacity: '1' },
    });

    expect(fade).toBe(fade2);
    expect(fade!.startsWith('vbox-kf-')).toBe(true);
  });

  test('uses a provided name when specified', () => {
    const fade = keyframes('fadeIn', {
      from: { opacity: '0' },
      to: { opacity: '1' },
    });

    expect(fade!.startsWith('fadeIn-')).toBe(true);
  });
});
