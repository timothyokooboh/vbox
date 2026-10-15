import test from 'node:test';
import assert from 'node:assert/strict';
import { renderStyles } from './support/render-styles.mjs';

test('malformed selectors fail before emitting malformed or unscoped rules', async () => {
  for (const selector of [
    '',
    ' ',
    '.item,',
    ',.item',
    '.item,,.other',
    '& >',
    '& >>> .item',
    'body { color:red }',
    '.item; body',
    '@media screen',
    ':is(',
    ':is(,)',
    ':not()',
    ':',
    '[data-x=]',
  ]) {
    await assert.rejects(
      renderStyles({ declarations: { [selector]: { color: 'red' } } }),
      /\[VBox\].*selector/i,
      selector,
    );
  }
  for (const selector of ['hover', ':hover, button'])
    await assert.rejects(
      renderStyles({ pseudos: { [selector]: { color: 'red' } } }),
      /\[VBox\].*selector/i,
      selector,
    );
});

test('parent references hidden only inside functions cannot create an unscoped alternative', async () => {
  for (const selector of [
    ':is(&, .outside)',
    ':where(&, .outside)',
    ':not(&)',
    ':has(&)',
  ])
    await assert.rejects(
      renderStyles({ declarations: { [selector]: { color: 'red' } } }),
      /\[VBox\].*outer.*&/i,
    );
});

test('bare content uses CSS string escapes and CSS quote controls remain keywords', async () => {
  const { css } = await renderStyles({
    pseudos: { '::before': { content: 'Line\n"two"\\end' } },
  });
  assert.ok(css.includes('content:"Line\\a \\"two\\"\\\\end";'));
  for (const keyword of [
    'open-quote',
    'close-quote',
    'no-open-quote',
    'no-close-quote',
  ]) {
    const { css } = await renderStyles({
      pseudos: { '::before': { content: keyword } },
    });
    assert.ok(css.includes(`content:${keyword};`));
  }
});

test('simple root pseudo equivalents normalize but an unanchored declaration pseudo stays a descendant target', async () => {
  const shorthand = await renderStyles({ hover: { color: 'red' } });
  assert.deepEqual(
    shorthand,
    await renderStyles({ pseudos: { ':hover': { color: 'red' } } }),
  );
  assert.deepEqual(
    shorthand,
    await renderStyles({ declarations: { '&:hover': { color: 'red' } } }),
  );
  const descendant = await renderStyles({
    declarations: { ':hover': { color: 'red' } },
  });
  assert.notEqual(shorthand.html, descendant.html);
  assert.match(descendant.css, / :hover/);
});

test('class, id and namespace delimiters cannot escape the generated scope', async () => {
  for (const selector of [
    '.item} body',
    '#item} body',
    '.item}body',
    '#item}body',
    '.safe, .bad}body',
    '.bad{body',
    '#bad{body',
    '.bad;body',
    '#bad;body',
    '.bad@media',
    'bad}ns|*',
  ])
    await assert.rejects(
      renderStyles({ declarations: { [selector]: { color: 'red' } } }),
      /\[VBox\].*selector/i,
      selector,
    );
});

test('legitimately escaped class and id delimiters remain valid relative selectors', async () => {
  for (const selector of [
    '.brace\\}name',
    '#brace\\}id',
    '.brace\\7d name',
    '#semi\\;id',
  ]) {
    const { css } = await renderStyles({
      declarations: { [selector]: { color: 'red' } },
    });
    assert.ok(css.includes(selector));
    assert.match(css, /^\.css-[\w-]+ /);
  }
});

test('quoted attribute punctuation and comments are not declaration delimiters', async () => {
  const { css } = await renderStyles({
    declarations: { '[data-x=";{}@"], .child /* } ; @ */': { color: 'red' } },
  });
  assert.ok(css.includes('[data-x=";{}@"]'));
  assert.ok(css.includes('.child'));
  assert.doesNotMatch(css, /(?:^|})\s*body\s*\{/);
});
