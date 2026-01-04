import { render, screen } from '@testing-library/vue';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import VBox from '../src/components/VBox.vue';

beforeEach(() => {
  // ensure global CSS object exists
  if (!globalThis.CSS) {
    globalThis.CSS = {
      supports: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
});

describe('VBox', () => {
  test('polymorphism: renders correct HTML tags', () => {
    render(VBox, {
      props: {
        is: 'h1',
      },
      slots: {
        default: 'Hello world',
      },
    });

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Hello world',
    });

    expect(heading).toBeDefined();
  });

  test('VBox with asChild renders the DOM element of its child', () => {
    render(VBox, {
      props: {
        asChild: true,
      },
      slots: {
        default: "<a href='https://google.com'>Visit google</a>",
      },
    });

    const link = screen.getByRole('link', {
      name: 'Visit google',
    });

    expect(link).toBeDefined();
  });

  test('asChild warns when multiple root nodes are passed', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(VBox, {
      props: {
        asChild: true,
      },
      slots: {
        default: `
          <h1>VBox makes styling easy</h1>
          <h2>VBox is cool</h2>
        `,
      },
    });

    expect(warnSpy).toHaveBeenCalledWith(
      '[VBox]: asChild expects exactly one root node.',
    );

    warnSpy.mockRestore();
  });
});
