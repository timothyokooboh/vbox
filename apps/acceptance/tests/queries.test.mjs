import test from 'node:test';
import assert from 'node:assert/strict';
import { renderStyles } from './support/render-styles.mjs';

test('query maps reject malformed keys with the group and authored query in the diagnostic', async () => {
  for (const [group, query] of [
    ['mq', '(min-width: 1px)'],
    ['mq', '@container card (width > 1px)'],
    ['cq', '@media (min-width: 1px)'],
    ['mq', '@media '],
    ['mq', '@media /* no condition */'],
    ['mq', '@media ()'],
    ['mq', '@media (/* no feature */)'],
    ['cq', '@container card'],
    ['cq', '@container card ()'],
    ['mq', '@media (width: 1px) /* unterminated'],
    ['cq', '@container '],
    ['mq', '@media (min-width: 1px'],
    ['cq', '@container card (width > 1px))'],
    ['mq', '@media screen; color:red'],
    ['cq', '@container card (width > 1px) { body {color:red} }'],
    ['mq', '@media (feature: "unterminated)'],
  ]) {
    await assert.rejects(
      renderStyles({ [group]: { [query]: { color: 'red' } } }),
      (error) =>
        error.message.includes('[VBox]') &&
        error.message.includes(group) &&
        error.message.includes('query'),
      `${group}: ${query}`,
    );
  }
});

test('same-target query conjunctions commute and deduplicate in SSR identity', async () => {
  const a = {
    mq: {
      '@media (min-width: 40rem)': {
        cq: {
          '@container Card (min-width: 400px)': {
            dark: { hover: { color: 'red' } },
          },
        },
      },
    },
  };
  const b = {
    hover: {
      dark: {
        cq: {
          '@container Card (min-width: 400px)': {
            mq: { '@media (min-width: 40rem)': { color: 'red' } },
          },
        },
      },
    },
  };
  const c = { mq: { ' @MEDIA (min-width: 40rem) ': a } };
  assert.deepEqual(await renderStyles(a), await renderStyles(b));
  assert.deepEqual(await renderStyles(a), await renderStyles(c));
});

test('query shapes cannot stringify or evaluate an object-looking string', async () => {
  for (const group of ['mq', 'cq']) {
    const query =
      group === 'mq'
        ? '@media (min-width: 1px)'
        : '@container Card (min-width: 1px)';
    for (const value of [
      '{color: "red"}',
      [],
      false,
      { [query]: 'color:red' },
      { [query]: [{ color: 'red' }] },
    ])
      await assert.rejects(
        renderStyles({ [group]: value }),
        /\[VBox\].*(object|scalar)/,
      );
    assert.equal((await renderStyles({ [group]: null })).css, '');
    assert.equal(
      (await renderStyles({ [group]: { [query]: undefined } })).css,
      '',
    );
  }
});

test('full query headers preserve names, lists, ranges, comments, quoted strings and future functions', async () => {
  for (const query of [
    '@media screen and (width >= 1px), print',
    '@media (prefers-reduced-motion: reduce)',
    '@media /* future feature */ (future-feature: "quoted)string")',
    '@media (future-feature: "escaped\\\"quote")',
  ]) {
    const { css } = await renderStyles({ mq: { [query]: { color: 'red' } } });
    assert.match(css, /@media.*color:red/s);
  }
  for (const query of [
    '@container Card (width >= 1px)',
    '@container style(--mode: dark)',
    '@container Card scroll-state(stuck: top)',
  ]) {
    const { css } = await renderStyles({ cq: { [query]: { color: 'red' } } });
    assert.ok(css.includes(query));
  }
});

test('nested condition normalization does not cross selector targets', async () => {
  const parent = {
    hover: {
      mq: { '@media (min-width: 1px)': { '.child': { color: 'red' } } },
    },
  };
  const child = {
    declarations: {
      '.child': {
        mq: { '@media (min-width: 1px)': { hover: { color: 'red' } } },
      },
    },
  };
  const a = await renderStyles(parent);
  const b = await renderStyles(child);
  assert.notEqual(a.html, b.html);
  assert.match(a.css, /:where\(:hover\) .child/);
  assert.match(b.css, /\.child:where\(:hover\)/);
});
