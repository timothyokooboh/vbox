import { vi, expect, test, beforeEach } from 'vitest';
import { isValidCssDeclaration } from '../src';

beforeEach(() => {
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

test('returns true in SSR when window is undefined', () => {
  const originalWindow = globalThis.window;
  // @ts-expect-error remove window to simulate SSR
  delete globalThis.window;

  expect(isValidCssDeclaration('color', 'red')).toBe(true);

  globalThis.window = originalWindow;
});
