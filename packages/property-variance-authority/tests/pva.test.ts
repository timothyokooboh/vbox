import { describe, expect, it } from 'vitest';
import { pva } from '../src';

describe('pva', () => {
  it('resolves defaults when no selection is passed', () => {
    const button = pva({
      variants: {
        variant: {
          solid: { color: 'white' },
          outline: { color: 'black' },
        },
        size: {
          sm: { px: 'sp-2' },
          md: { px: 'sp-4' },
        },
      },
      defaultVariants: {
        variant: 'solid',
        size: 'md',
      },
    });

    expect(button()).toEqual({ color: 'white', px: 'sp-4' });
  });

  it('allows explicit selection to override defaults', () => {
    const button = pva({
      variants: {
        variant: {
          solid: { color: 'white', bg: 'brand' },
          outline: { color: 'ink', bg: 'transparent' },
        },
      },
      defaultVariants: {
        variant: 'solid',
      },
    });

    expect(button({ variant: 'outline' })).toEqual({
      color: 'ink',
      bg: 'transparent',
    });
  });

  it('applies compound styles when all conditions match', () => {
    const badge = pva({
      variants: {
        variant: {
          dense: { fontWeight: 600 },
          subtle: { fontWeight: 400 },
        },
        intent: {
          success: { bg: 'green' },
          danger: { bg: 'red' },
        },
      },
      defaultVariants: {
        variant: 'dense',
        intent: 'success',
      },
      compoundVariants: [
        {
          variant: 'dense',
          intent: 'success',
          styles: { bg: 'darkgreen', color: '#efefef' },
        },
      ],
    });

    expect(badge()).toEqual({
      fontWeight: 600,
      bg: 'darkgreen',
      color: '#efefef',
    });
  });

  it('supports array condition matching in compounds', () => {
    const component = pva({
      variants: {
        intent: {
          success: { color: 'green' },
          warning: { color: 'orange' },
          danger: { color: 'red' },
        },
      },
      compoundVariants: [
        {
          intent: ['warning', 'danger'],
          styles: { border: '1px solid currentColor' },
        },
      ],
    });

    expect(component({ intent: 'success' })).toEqual({ color: 'green' });
    expect(component({ intent: 'danger' })).toEqual({
      color: 'red',
      border: '1px solid currentColor',
    });
  });

  it('applies compound variants in declaration order', () => {
    const button = pva({
      variants: {
        variant: {
          solid: { color: 'white' },
          outline: { color: 'black' },
        },
      },
      defaultVariants: {
        variant: 'solid',
      },
      compoundVariants: [
        {
          variant: 'solid',
          styles: { color: 'yellow', bg: 'darkred' },
        },
        {
          variant: 'solid',
          styles: { color: 'orange' },
        },
      ],
    });

    expect(button()).toEqual({ color: 'orange', bg: 'darkred' });
  });

  it('returns empty object when selection/defaults are missing', () => {
    const resolver = pva({
      variants: {
        tone: {
          primary: { color: 'white' },
        },
      },
    });

    expect(resolver()).toEqual({});
  });

  it('does not mutate source style objects', () => {
    const solid = { color: 'white' };
    const defaults = { variant: 'solid' } as const;

    const resolver = pva({
      variants: {
        variant: {
          solid,
          outline: { color: 'black' },
        },
      },
      defaultVariants: defaults,
      compoundVariants: [
        { variant: 'solid', styles: { bg: 'brand' } },
      ],
    });

    const result = resolver();

    expect(result).toEqual({ color: 'white', bg: 'brand' });
    expect(solid).toEqual({ color: 'white' });
    expect(defaults).toEqual({ variant: 'solid' });
  });

  it('matches compounds against resolved defaults + explicit values', () => {
    const resolver = pva({
      variants: {
        size: {
          sm: { py: '2px' },
          md: { py: '4px' },
        },
        intent: {
          primary: { color: 'white' },
          ghost: { color: 'ink' },
        },
      },
      defaultVariants: {
        size: 'md',
        intent: 'primary',
      },
      compoundVariants: [
        {
          size: 'md',
          intent: 'ghost',
          styles: { py: '6px' },
        },
      ],
    });

    expect(resolver({ intent: 'ghost' })).toEqual({ color: 'ink', py: '6px' });
  });
});
