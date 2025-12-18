import { vi, expect, test, beforeEach } from 'vitest';
import { isValidCssDeclaration } from '../src';

beforeEach(() => {
  // ensure global CSS object exists
  if (!globalThis.CSS) {
    globalThis.CSS = {
      supports: vi.fn(),
    } as any;
  }
});

test('caches CSS.supports results', () => {
  const spy = vi.spyOn(globalThis.CSS, 'supports').mockReturnValue(true);

  expect(isValidCssDeclaration('opacity', '0')).toBe(true);
  expect(isValidCssDeclaration('opacity', '0')).toBe(true);
  expect(isValidCssDeclaration('opacity', '0')).toBe(true);

  // second and third call uses cache
  expect(spy).toHaveBeenCalledTimes(1);
  spy.mockRestore();
});

test('calls CSS.supports with correct args', () => {
  const spy = vi.spyOn(globalThis.CSS, 'supports').mockReturnValue(true);
  isValidCssDeclaration('display', 'flex !important');
  expect(spy).toHaveBeenCalledWith('display: flex !important');
  spy.mockRestore();
});
