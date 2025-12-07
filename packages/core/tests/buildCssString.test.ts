import { describe, expect, test } from 'vitest';
import { buildCssString } from '../src/helpers/buildCssString';

describe('buildCssString', () => {
  const baseArgs = {
    rootStyles: {},
    rootDarkStyles: {},
    pseudoStyles: {},
    selectorBlocks: {},
    breakpointStyles: {},
    customMediaQueries: {},
    containerQueries: {},
    className: 'box',
  };

  test('builds base styles', () => {
    const css = buildCssString({
      ...baseArgs,
      rootStyles: { color: 'red', 'font-size': '1rem' },
    });

    expect(css).toBe(`.box { color: red; font-size: 1rem; }`);
  });

  test('builds empty base styles', () => {
    const css = buildCssString({
      ...baseArgs,
    });

    expect(css).toBe(`.box {  }`);
  });

  test('builds dark theme styles when provided', () => {
    const css = buildCssString({
      ...baseArgs,
      rootDarkStyles: { color: 'white' },
    });

    expect(css).toContain(`html.dark { .box { color: white; } }`);
  });

  test('does not render dark theme section when empty', () => {
    const css = buildCssString({
      ...baseArgs,
      rootDarkStyles: {},
    });

    expect(css).not.toContain('html.dark');
  });

  test('builds pseudo styles with auto-prefixed colon', () => {
    const css = buildCssString({
      ...baseArgs,
      pseudoStyles: {
        hover: { color: 'red' },
      },
    });

    expect(css).toContain(`.box:hover { color: red; }`);
  });

  test('builds pseudo styles when colon already exists', () => {
    const css = buildCssString({
      ...baseArgs,
      pseudoStyles: {
        ':focus-visible': { outline: 'none' },
      },
    });

    expect(css).toContain(`.box:focus-visible { outline: none; }`);
  });

  test('builds nested selectors under matching pseudo', () => {
    const css = buildCssString({
      ...baseArgs,
      pseudoStyles: {
        hover: { color: 'red' },
      },
      selectorBlocks: {
        '.box:hover .child': { color: 'blue' },
      },
    });

    expect(css).toContain(`.box:hover .child { color: blue; }`);
  });

  test('builds breakpoint styles as media queries', () => {
    const css = buildCssString({
      ...baseArgs,
      breakpointStyles: {
        '600px': { display: 'flex' },
      },
    });

    expect(css).toContain(
      `@media (min-width: 600px) { .box { display: flex; } }`,
    );
  });

  test('builds custom media queries', () => {
    const css = buildCssString({
      ...baseArgs,
      customMediaQueries: {
        '@media (orientation: landscape)': { color: 'red' },
      },
    });

    expect(css).toContain(
      `@media (orientation: landscape) { .box { color: red; } }`,
    );
  });

  test('builds container queries', () => {
    const css = buildCssString({
      ...baseArgs,
      containerQueries: {
        '@container card (min-width: 400px)': { padding: '1rem' },
      },
    });

    expect(css).toContain(
      `@container card (min-width: 400px) { .box { padding: 1rem; } }`,
    );
  });

  test('builds selector styles', () => {
    const css = buildCssString({
      ...baseArgs,
      selectorBlocks: {
        '.title': { color: 'red' },
      },
    });

    expect(css).toContain(`.box .title { color: red; }`);
  });

  test('replaces & with className', () => {
    const css = buildCssString({
      ...baseArgs,
      selectorBlocks: {
        '&:hover': { color: 'blue' },
      },
    });

    expect(css).toContain(`.box:hover { color: blue; }`);
  });

  test('skips invalid selectors', () => {
    // const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const css = buildCssString({
      ...baseArgs,
      selectorBlocks: {
        '   ': { color: 'red' }, // invalid selector
      },
    });

    expect(css).not.toContain(`.box { color: red; }`);
    // expect(warn).toHaveBeenCalled();

    // warn.mockRestore();
  });

  test('builds css string for selectors inside breakpoints', () => {
    const css = buildCssString({
      ...baseArgs,
      selectorBlocks: {
        'bp::40rem::& :has(a)': { width: '250px' },
      },
    });

    expect(css).toContain(
      `@media (min-width: 40rem) { .box :has(a) { width: 250px; } }`,
    );
  });

  test('builds css string for selectors inside media queries', () => {
    const css = buildCssString({
      ...baseArgs,
      selectorBlocks: {
        'mbp::@media (min-width: 500px)::& :has(a)': {
          width: '250px',
        },
      },
    });

    expect(css).toContain(
      `@media (min-width: 500px) { .box :has(a) { width: 250px; } }`,
    );
  });

  test('builds css string for selectors inside container queries', () => {
    const css = buildCssString({
      ...baseArgs,
      selectorBlocks: {
        'cbp::@container (min-width: 500px)::& :has(a)': {
          padding: '2rem',
        },
      },
    });

    expect(css).toContain(
      `@container (min-width: 500px) { .box :has(a) { padding: 2rem; } }`,
    );
  });

  test('renders dark:: selector blocks', () => {
    const css = buildCssString({
      ...baseArgs,
      selectorBlocks: {
        'dark::& p': { color: 'white' },
        'dark::& img': { height: '100px' },
      },
    });

    expect(css).toContain(`html.dark { .box p { color: white; } }`);
    expect(css).toContain(`html.dark { .box img { height: 100px; } }`);
  });

  test('auto-quotes content values when missing', () => {
    const css = buildCssString({
      ...baseArgs,
      selectorBlocks: {
        '.title::after': { content: 'hello' },
      },
    });

    expect(css).toContain(`content: "hello";`);
  });

  test('does not double-quote content when already quoted', () => {
    const css = buildCssString({
      ...baseArgs,
      selectorBlocks: {
        '.title::after': { content: "'hello'" },
      },
    });

    expect(css).toContain(`content: 'hello';`);
  });
});
