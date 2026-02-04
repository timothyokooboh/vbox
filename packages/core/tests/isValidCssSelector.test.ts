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

test('returns true in SSR when document is undefined', () => {
  const originalDocument = globalThis.document;
  // @ts-expect-error remove document to simulate SSR
  delete globalThis.document;

  expect(isValidCssSelector('& > a')).toBe(true);

  globalThis.document = originalDocument;
});
