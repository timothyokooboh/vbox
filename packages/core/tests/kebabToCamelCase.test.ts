import { expect, test } from 'vitest';
import { kebabToCamelCase } from '../src/helpers/kebabToCamelCase';

test('converts kebab case to camel case', () => {
  expect(kebabToCamelCase('font-size')).toBe('fontSize');
  expect(kebabToCamelCase('background-color')).toBe('backgroundColor');
});

test('preserves special characters during conversion', () => {
  expect(kebabToCamelCase(':focus-visible')).toBe(':focusVisible');
  expect(kebabToCamelCase(':focus-within')).toBe(':focusWithin');
  expect(kebabToCamelCase('--border-input')).toBe('--borderInput');
});
