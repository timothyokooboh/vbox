import { describe, expect, test } from 'vitest';
import { buildRules } from '../src/helpers/buildRules';

describe('buildRules', () => {
  test('returns valid css string', () => {
    expect(buildRules({ color: 'red', fontSize: '1rem' })).toEqual(
      'color: red; fontSize: 1rem;',
    );

    expect(
      buildRules({ border: '1px solid red', position: 'relative' }),
    ).toStrictEqual('border: 1px solid red; position: relative;');
  });

  test('returns empty string for empty object', () => {
    expect(buildRules({})).toBe('');
  });

  test('keeps keys exactly as provided', () => {
    expect(buildRules({ fontSize: '12px' })).toBe('fontSize: 12px;');
  });

  test('preserves whitespace in values', () => {
    expect(buildRules({ color: '   red  ' })).toBe('color:    red  ;');
  });

  test('handles numeric values', () => {
    expect(buildRules({ opacity: 1 as unknown as string })).toBe('opacity: 1;');
  });

  test('preserves property order', () => {
    expect(buildRules({ a: '1', b: '2', c: '3' })).toBe('a: 1; b: 2; c: 3;');
  });
});
