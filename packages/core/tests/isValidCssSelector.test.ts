import { expect, test } from 'vitest';
import { isValidCssSelector } from '../src/helpers/isValidCssSelector';

test('is a valid css selector', () => {
  expect(isValidCssSelector('& > a')).toBe(true);
  expect(isValidCssSelector('& :has(a)')).toBe(true);
});

test('is not a valid css selector', () => {
  expect(isValidCssSelector('& > a.')).toBe(false);
  expect(isValidCssSelector('^& :has(a)')).toBe(false);
});
