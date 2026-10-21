import test from 'node:test';
import assert from 'node:assert/strict';
import { renderStyles as render } from './support/render-styles.mjs';

test('ordered sources preserve repeated declarations and direct bindings come last', async () => {
  const { css } = await render(
    [
      { padding: '8px', color: 'red' },
      { paddingLeft: '20px', color: 'not-a-valid-color' },
      false,
      null,
      undefined,
    ],
    { padding: '12px' },
  );
  assert.match(
    css,
    /padding:8px;.*color:red;.*padding-left:20px;.*color:not-a-valid-color;.*padding:12px;/s,
  );
});

test('false only omits conditional array entries and other invalid source shapes fail', async () => {
  for (const input of [
    false,
    true,
    0,
    '',
    [0],
    [''],
    [[]],
    { color: false },
    { hover: false },
  ]) {
    await assert.rejects(render(input), /\[VBox\].*(object|scalar)/i);
  }
  assert.equal((await render([false, null, undefined])).css, '');
});

test('null contributions do not delete remaining declarations in matching contexts', async () => {
  const sources = Object.freeze([
    Object.freeze({ _disabled: Object.freeze({ color: 'red', opacity: 0.2 }) }),
    Object.freeze({ disabled: Object.freeze({ color: null, opacity: 0 }) }),
  ]);
  const { css } = await render(sources, { disabled: { color: undefined } });
  assert.match(css, /:disabled.*color:red;.*opacity:0.2;.*opacity:0;/s);
  assert.doesNotMatch(css, /null|undefined|\[object Object\]/);
  assert.equal(sources[0]._disabled.opacity, 0.2);
});

test('alias/casing conflicts within an object preserve declaration sequence', async () => {
  const { css } = await render({
    paddingLeft: '10px',
    p: '8px',
    'padding-left': '20px',
  });
  assert.match(css, /padding-left:10px;.*padding:8px;.*padding-left:20px;/s);
});

test('content reset keywords are not automatically quoted', async () => {
  for (const value of [
    'initial',
    'inherit',
    'unset',
    'revert',
    'revert-layer',
  ]) {
    const { css } = await render({ content: value });
    assert.ok(css.includes(`content:${value};`));
  }
});
