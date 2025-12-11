import { describe, expect, test } from 'vitest';
import { parseTokens } from '../src/helpers/parseTokens';

describe('parseTokens', () => {
  test('parses color tokens', () => {
    expect(parseTokens('cl-red-200')).toBe('var(--color-red-200)');
  });

  test('parses font-size tokens', () => {
    expect(parseTokens('fs-sm')).toBe('var(--font-size-sm)');
  });

  test('parses font-weight tokens', () => {
    expect(parseTokens('fw-thin')).toBe('var(--font-weight-thin)');
  });

  test('parses font-family tokens', () => {
    expect(parseTokens('ff-sora')).toBe('var(--font-family-sora)');
  });

  test('parses line-height tokens', () => {
    expect(parseTokens('lh-sm')).toBe('var(--line-height-sm)');
  });

  test('parses letter-spacing tokens', () => {
    expect(parseTokens('ls-sm')).toBe('var(--letter-spacing-sm)');
  });

  test('parses spacing tokens', () => {
    expect(parseTokens('sp-xs')).toBe('var(--spacing-xs)');
  });

  test('parses border-radius', () => {
    expect(parseTokens('br-md')).toBe('var(--border-radius-md)');
  });

  test('parses z-index', () => {
    expect(parseTokens('z-modal')).toBe('var(--z-index-modal)');
  });

  test('supports compound values', () => {
    expect(parseTokens('fs-xl solid cl-red-600')).toBe(
      'var(--font-size-xl) solid var(--color-red-600)',
    );

    expect(parseTokens('var(--font-size-xl) solid cl-red-600')).toBe(
      'var(--font-size-xl) solid var(--color-red-600)',
    );

    expect(parseTokens('fs-xl solid var(--color-red-600)')).toBe(
      'var(--font-size-xl) solid var(--color-red-600)',
    );

    expect(parseTokens('var(--font-size-xl) solid var(--color-red-600)')).toBe(
      'var(--font-size-xl) solid var(--color-red-600)',
    );
  });

  test('leaves existing var() values untouched', () => {
    expect(parseTokens('var(--color-red-300)')).toBe('var(--color-red-300)');

    expect(parseTokens('var(--z-index-modal)')).toBe('var(--z-index-modal)');

    expect(parseTokens('var(--color-red-cl-100)')).toBe(
      'var(--color-red-cl-100)',
    );
  });

  test('multiple tokens in same string', () => {
    expect(parseTokens('fs-xs sp-sm cl-red-200')).toBe(
      'var(--font-size-xs) var(--spacing-sm) var(--color-red-200)',
    );
  });

  test('unknown prefixes remain unchanged', () => {
    expect(parseTokens('xx-blue-400')).toBe('xx-blue-400');
  });

  test('returns input if not a string', () => {
    // @ts-expect-error test robustness
    expect(parseTokens(null)).toBe(null);
  });

  test('gracefully skips invalid formats', () => {
    expect(parseTokens('cl-')).toBe('cl-');
    expect(parseTokens('fs-')).toBe('fs-');
  });
});
