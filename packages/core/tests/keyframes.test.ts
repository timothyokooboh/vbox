import { describe, test, vi, expect, beforeEach } from 'vitest';
import { keyframes } from '../src/helpers/keyframes';
import { createStyleCollector } from '../src/helpers/styleRegistry';

describe('keyframes', () => {
  beforeEach(() => {
    document.head.innerHTML = '';

    if (!globalThis.CSS) {
      Object.defineProperty(globalThis, 'CSS', {
        value: {},
        configurable: true,
        writable: true,
      });
    }

    Object.defineProperty(globalThis.CSS, 'supports', {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });
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

  test('collects keyframes in SSR collector when provided', () => {
    const collector = createStyleCollector();
    const name = keyframes(
      'fadeIn',
      { from: { opacity: '0' }, to: { opacity: '1' } },
      { collector },
    );

    const css = collector.getCss();
    expect(css).toContain(`@keyframes ${name}`);
  });
});
