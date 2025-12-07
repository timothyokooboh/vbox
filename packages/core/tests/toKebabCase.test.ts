import { expect, test } from 'vitest';
import { toKebabCase } from '../src/helpers/toKebabCase';

test('converts to kebab case', () => {
  expect(toKebabCase('fontSize')).toBe('font-size');
  expect(toKebabCase('backgroundColor')).toBe('background-color');
});

test('preserves special characters during conversion', () => {
  expect(toKebabCase(':focusVisible')).toBe(':focus-visible');
  expect(toKebabCase(':focusWithin')).toBe(':focus-within');
});
