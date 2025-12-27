import { deepMerge } from '../src/helpers/mergeTheme';
import { test, describe, expect } from 'vitest';

describe('deepMerge', () => {
  test('returns base object when override object is undefined', () => {
    const base = {
      color: {
        primary: '#ed12bc',
      },
    };

    const result = deepMerge(base, undefined);

    expect(result).toEqual(base);
  });

  test('merges values with override winning when the same keys exist', () => {
    const base = {
      fontSize: { sm: '12px', md: '14px' },
    };

    const override = {
      fontSize: { md: '15px', lg: '18px' },
    };

    const result = deepMerge(base, override);
    expect(result).toEqual({
      fontSize: {
        sm: '12px',
        md: '15px',
        lg: '18px',
      },
    });
  });

  test('deep merges nested objects', () => {
    const base = {
      color: {
        'red-100': {
          default: '#ffcccc',
          dark: '#ffaaaa',
        },
        'red-200': {
          default: '#ff0011',
          dark: '#cc0033',
        },
      },
    };

    const override = {
      color: {
        'red-100': {
          default: '#ff0000',
          dark: '#cc0000',
        },
      },
    };

    const result = deepMerge(base, override);

    expect(result).toEqual({
      color: {
        'red-100': {
          default: '#ff0000',
          dark: '#cc0000',
        },
        'red-200': {
          default: '#ff0011',
          dark: '#cc0033',
        },
      },
    });
  });

  test('does not mutate base or override objects', () => {
    const base = { fontSize: { sm: '12px' } };
    const override = { fontSize: { sm: '13px' } };

    const baseCopy = structuredClone(base);
    const overrideCopy = structuredClone(override);

    deepMerge(base, override);

    expect(base).toEqual(baseCopy);
    expect(override).toEqual(overrideCopy);
  });
});
