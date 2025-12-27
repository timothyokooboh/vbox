import { describe, test, expect } from 'vitest';
import { injectCSS, createVendorPrefix } from '../src/helpers/injectCSS';

describe('injectCSS', () => {
  test('does not throw in SSR (window undefined)', () => {
    // @ts-ignore
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(() => injectCSS('.foo { color: red; }')).not.toThrow();

    // restore
    // @ts-ignore
    global.window = originalWindow;
  });

  test('creates a <style> element if none exists', () => {
    injectCSS('.foo { color: red; }');

    const styleEl = document.getElementById('vbox-style-sheet');
    expect(styleEl).not.toBeNull();
    expect(styleEl!.tagName).toBe('STYLE');
    expect(styleEl!.textContent).toContain('color:red');
  });

  test('does not create multiple <style> elements', () => {
    injectCSS('.foo { color: red; }');
    injectCSS('.bar { color: blue; }');

    const styleEls = document.querySelectorAll('#vbox-style-sheet');
    expect(styleEls.length).toBe(1);

    const styleEl = styleEls[0] as HTMLStyleElement;
    expect(styleEl.textContent).toContain('color:red');
    expect(styleEl.textContent).toContain('color:blue');
  });

  test('does not duplicate CSS rules', () => {
    injectCSS('.foo { color: red; }');
    injectCSS('.foo { color: red; }');

    const styleEl = document.getElementById(
      'vbox-style-sheet',
    ) as HTMLStyleElement;
    const occurrences = (styleEl.textContent || '').match(/color:red/g);
    expect(occurrences?.length).toBe(1);
  });

  test('applies vendor prefixes using Stylis', () => {
    injectCSS('.foo { user-select: none; }');

    const styleEl = document.getElementById(
      'vbox-style-sheet',
    ) as HTMLStyleElement;
    expect(styleEl.textContent).toContain('-webkit-user-select');
    expect(styleEl.textContent).toContain('user-select');
  });

  test('caches prefixed CSS strings', async () => {
    const css = 'user-select: none;';
    const first = createVendorPrefix(css);
    const second = createVendorPrefix(css);

    expect(first).toBe(second);
  });

  test('injects multiple different CSS rules correctly', () => {
    injectCSS('.foo { color: red; }');
    injectCSS('.bar { display: flex; }');

    const styleEl = document.getElementById(
      'vbox-style-sheet',
    ) as HTMLStyleElement;
    expect(styleEl.textContent).toContain('color:red');
    expect(styleEl.textContent).toContain('-webkit-flex');
    expect(styleEl.textContent).toContain('display:flex');
  });
});
