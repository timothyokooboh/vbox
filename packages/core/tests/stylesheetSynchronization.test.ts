import { expect, test } from 'vitest';
import { injectStyleBundle } from '../src/index';

test('unchanged public style contributions do not rewrite the live stylesheet', () => {
  const bundle = {
    key: 'quality-repeat',
    ownerDepth: 0,
    rules: [{ context: [], css: '.quality-repeat{color:red;}' }],
  };
  injectStyleBundle(bundle);
  const sheet = document.getElementById('vbox-style-sheet')!;
  const observer = new MutationObserver(() => {});
  observer.observe(sheet, { childList: true });
  try {
    injectStyleBundle(bundle);
    expect(observer.takeRecords()).toHaveLength(0);
  } finally {
    observer.disconnect();
  }
});

test('changed same-key contributions update computed styles and recreate a removed sheet', () => {
  const element = document.createElement('div');
  element.className = 'quality-update';
  document.body.append(element);
  const contribution = (color: string) => ({
    key: 'quality-update',
    ownerDepth: 0,
    rules: [{ context: [], css: `.quality-update{color:${color};}` }],
  });
  try {
    injectStyleBundle(contribution('red'));
    expect(getComputedStyle(element).color).toBe('rgb(255, 0, 0)');
    injectStyleBundle(contribution('blue'));
    expect(getComputedStyle(element).color).toBe('rgb(0, 0, 255)');
    document.getElementById('vbox-style-sheet')!.remove();
    injectStyleBundle(contribution('blue'));
    expect(getComputedStyle(element).color).toBe('rgb(0, 0, 255)');
    expect(document.querySelectorAll('#vbox-style-sheet')).toHaveLength(1);
  } finally {
    element.remove();
  }
});
