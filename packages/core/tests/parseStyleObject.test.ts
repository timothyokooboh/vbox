import { describe, beforeEach, vi, test, expect } from 'vitest';
import { parseStyleObject } from '../src/helpers/parseStyleObject';
import type { AliasMap } from '../src/types';

beforeEach(() => {
  // ensure global CSS object exists
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

  vi.spyOn(globalThis.CSS, 'supports').mockReturnValue(true);
});

describe('parseStyleObject', () => {
  const aliases = {
    mTop: 'marginBlockStart',
    mBottom: 'marginBlockEnd',
  } as unknown as AliasMap;

  const breakpoints = {
    sm: '40rem',
    md: '48rem',
    lg: '64rem',
    xl: '80rem',
  };

  test('handles direct CSS properties', () => {
    const result = parseStyleObject({
      obj: { color: 'red', mTop: '10px' },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.rootStyles).toEqual({
      color: 'red',
      'margin-block-start': '10px',
    });

    expect(result.pseudoStyles).toEqual({});
    expect(result.breakpointStyles).toEqual({});
    expect(result.selectorBlocks).toEqual({});
  });

  test('handles dark styles', () => {
    const result = parseStyleObject({
      obj: { dark: { color: 'white' } },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.rootDarkStyles).toEqual({ color: 'white' });
  });

  test('handles pseudo props', () => {
    const result = parseStyleObject({
      obj: {
        color: 'blue',
        hover: { color: 'blue' },
        focusVisible: { outline: '1px solid pink' },
      },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.pseudoStyles).toEqual({
      hover: { color: 'blue' },
      focusVisible: { outline: '1px solid pink' },
    });
  });

  test('resolves aliases', () => {
    const result = parseStyleObject({
      obj: { fontSize: '1rem', mTop: '5px', mBottom: '8px' },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.rootStyles).toEqual({
      'font-size': '1rem',
      'margin-block-start': '5px',
      'margin-block-end': '8px',
    });
  });

  test('handles breakpoints', () => {
    const result = parseStyleObject({
      obj: { sm: { color: 'red' } },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.breakpointStyles).toEqual({ '40rem': { color: 'red' } });
  });

  test('handles css selectors inside breakpoints', () => {
    const result = parseStyleObject({
      obj: { sm: { color: 'red', '& :has(a)': { width: '250px' } } },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.selectorBlocks).toHaveProperty('bp::40rem::& :has(a)');
    expect(result.selectorBlocks['bp::40rem::& :has(a)']).toStrictEqual({
      width: '250px',
    });
  });

  test('handles media queries', () => {
    const result = parseStyleObject({
      obj: {
        mq: {
          '@media (min-width: 500px)': { color: 'purple' },
        },
      },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.customMediaQueries).toEqual({
      '@media (min-width: 500px)': { color: 'purple' },
    });
  });

  test('handles css selectors inside media queries', () => {
    const result = parseStyleObject({
      obj: {
        mq: {
          '@media (min-width: 500px)': {
            color: 'purple',
            '& :has(a)': { width: '250px' },
          },
        },
      },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.selectorBlocks).toHaveProperty(
      'mbp::@media (min-width: 500px)::& :has(a)',
    );

    expect(
      result.selectorBlocks['mbp::@media (min-width: 500px)::& :has(a)'],
    ).toStrictEqual({ width: '250px' });
  });

  test('handles container queries', () => {
    const result = parseStyleObject({
      obj: {
        cq: {
          '@container (min-width: 500px)': { color: 'purple' },
        },
      },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.containerQueries).toEqual({
      '@container (min-width: 500px)': { color: 'purple' },
    });
  });

  test('handles css selectors inside container queries', () => {
    const result = parseStyleObject({
      obj: {
        cq: {
          '@container (min-width: 500px)': {
            color: 'purple',
            '& :has(a)': { width: '250px' },
          },
        },
      },
      aliases,
      className: 'shr',
      breakpoints,
    });

    expect(result.selectorBlocks).toHaveProperty(
      'cbp::@container (min-width: 500px)::& :has(a)',
    );

    expect(
      result.selectorBlocks['cbp::@container (min-width: 500px)::& :has(a)'],
    ).toStrictEqual({ width: '250px' });
  });
});
