import { test, expect } from './fixtures';

test('each pseudo list branch styles the target rather than a descendant', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('selector-pseudo-list');
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.mouse.move(0, 0);
  await target.focus();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
});

test('selector lists, functional commas and attribute strings stay scoped through updates', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const root = page.getByTestId('selector-lists');
  for (const color of ['rgb(255, 0, 0)', 'rgb(0, 0, 255)']) {
    for (const name of ['A inside', 'B inside'])
      await expect(root.getByText(name, { exact: true })).toHaveCSS(
        'color',
        color,
      );
    await expect(root).toHaveCSS('border-top-width', '2px');
    await expect(root.getByText('Comma inside')).toHaveCSS(
      'border-top-width',
      '2px',
    );
    for (const id of [
      'selector-outside-a',
      'selector-outside-b',
      'selector-outside-comma',
    ]) {
      await expect(page.getByTestId(id)).toHaveCSS('color', 'rgb(0, 0, 0)');
      await expect(page.getByTestId(id)).toHaveCSS('border-top-width', '0px');
    }
    await page.getByRole('button', { name: 'Update selector styles' }).click();
  }
});

test('pseudo-element content functions stay CSS and react to authored values', async ({
  page,
}) => {
  await page.goto('/');
  const content = (id: string) =>
    page
      .getByTestId(id)
      .evaluate((el) => getComputedStyle(el, '::before').content);
  await expect.poll(() => content('selector-content-attr')).toBe('"Label"');
  await expect.poll(() => content('selector-content-var')).toBe('"Custom"');
  await page.getByRole('button', { name: 'Update selector styles' }).click();
  await expect.poll(() => content('selector-content-attr')).toBe('"Updated"');
});

test('conditional wrappers preserve pseudo-element targets and withdrawing a pseudo reveals defaults', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto('/?ssr');
  const pseudo = (id: string, key: 'content' | 'color') =>
    page
      .getByTestId(id)
      .evaluate((el, key) => getComputedStyle(el, '::before')[key], key);
  const target = page.getByTestId('selector-conditional');
  await target.hover();
  await expect
    .poll(() => pseudo('selector-conditional', 'content'))
    .toBe('"Base"');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect
    .poll(() => pseudo('selector-conditional', 'content'))
    .toBe('"Conditional"');
  await expect
    .poll(() => pseudo('selector-conditional', 'color'))
    .toBe('rgb(0, 0, 255)');
  await page.setViewportSize({ width: 750, height: 800 });
  await target.hover();
  await expect
    .poll(() => pseudo('selector-conditional', 'content'))
    .toBe('"Base"');
  await expect
    .poll(() => pseudo('selector-withdrawal', 'content'))
    .toBe('"Override"');
  await page.getByRole('button', { name: 'Update selector styles' }).click();
  await expect
    .poll(() => pseudo('selector-withdrawal', 'content'))
    .toBe('"Base"');
  await expect
    .poll(() => pseudo('selector-withdrawal', 'color'))
    .toBe('rgb(255, 0, 0)');
});

test('arbitrary selectors retain specificity, ancestor references and escaped syntax', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('selector-specificity')).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
  await expect(page.getByTestId('selector-parent-ref')).toHaveCSS(
    'color',
    'rgb(128, 0, 128)',
  );
  await expect(page.getByTestId('selector-escaped')).toHaveCSS(
    'color',
    'rgb(0, 128, 0)',
  );
  await expect(page.getByTestId('selector-amp-attribute')).toHaveCSS(
    'color',
    'rgb(0, 128, 0)',
  );
});

test('external layers, ordinary CSS, inline styles and important rules remain browser cascade participants', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('selector-external');
  await page.addStyleTag({
    content: '@layer third-party { .selector-external { color: blue; } }',
  });
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.addStyleTag({ content: '.selector-external { color: blue; }' });
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  await target.evaluate((el) => {
    el.style.color = 'green';
  });
  await expect(target).toHaveCSS('color', 'rgb(0, 128, 0)');
  await page.addStyleTag({
    content: '.selector-external { color: purple !important; }',
  });
  await expect(target).toHaveCSS('color', 'rgb(128, 0, 128)');
});

test('a declaration pseudo without an ampersand targets descendants, not the root', async ({
  page,
}) => {
  await page.goto('/');
  const root = page.getByTestId('selector-descendant-state');
  const child = page.getByTestId('selector-descendant-state-child');
  await root.hover({ position: { x: 2, y: 2 } });
  await expect(root).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(child).toHaveCSS('color', 'rgb(0, 0, 0)');
  await child.hover();
  await expect(root).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(child).toHaveCSS('color', 'rgb(255, 0, 0)');
});

test('escaped delimiter identifiers match only their scoped descendants', async ({
  page,
}) => {
  await page.goto('/?ssr');
  for (const id of ['selector-escaped-brace', 'selector-escaped-id'])
    await expect(page.getByTestId(id)).toHaveCSS('color', 'rgb(128, 0, 128)');
  await expect(page.getByTestId('selector-outside-brace')).toHaveCSS(
    'color',
    'rgb(0, 0, 0)',
  );
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(0, 0, 0)');
});
