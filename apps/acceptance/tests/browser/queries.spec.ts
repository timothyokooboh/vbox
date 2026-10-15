import { test, expect } from './fixtures';

test('overlapping query priority is independent of source and registration order, not numeric unit guesses', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto('/');
  for (let iteration = 0; iteration < 3; iteration++) {
    for (const id of ['query-media-a', 'query-media-b'])
      await expect(page.getByTestId(id)).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(page.getByTestId('query-container')).toHaveCSS(
      'color',
      'rgb(128, 0, 128)',
    );
    await expect(page.getByTestId('query-families')).toHaveCSS(
      'color',
      'rgb(128, 0, 128)',
    );
    await page.getByRole('button', { name: 'Reverse query sources' }).click();
  }
});

test('named and nearest containers resize independently of viewport and retain case-sensitive names', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto('/?ssr');
  await expect(page.getByTestId('query-named')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
  await expect(page.getByTestId('query-wrong-name')).toHaveCSS(
    'color',
    'rgb(0, 0, 0)',
  );
  await page.getByRole('button', { name: 'Resize query container' }).click();
  await expect(page.getByTestId('query-families')).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
  await page.setViewportSize({ width: 400, height: 800 });
  await expect(page.getByTestId('query-families')).toHaveCSS(
    'color',
    'rgb(0, 0, 0)',
  );
  await page.getByRole('button', { name: 'Resize query container' }).click();
  await expect(page.getByTestId('query-families')).toHaveCSS(
    'color',
    'rgb(128, 0, 128)',
  );
  await expect(page.getByTestId('query-named')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
});

test('media, container, theme, named breakpoint and interaction nest conjunctively', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto('/');
  const target = page.getByTestId('query-combined');
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(target).toHaveCSS('color', 'rgb(255, 165, 0)');
  await page.getByRole('button', { name: 'Resize query container' }).click();
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.getByRole('button', { name: 'Resize query container' }).click();
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 165, 0)');
  await page.setViewportSize({ width: 750, height: 800 });
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.setViewportSize({ width: 900, height: 800 });
  await page.mouse.move(0, 0);
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
});

test('matching query ties use source order, direct bindings win, and null/undefined reveal remaining contributions', async ({
  page,
}) => {
  await page.goto('/?ssr');
  for (const color of [
    'rgb(255, 0, 0)',
    'rgb(0, 128, 0)',
    'rgb(0, 128, 0)',
    'rgb(255, 0, 0)',
  ]) {
    for (const id of [
      'query-withdrawal',
      'query-branch-withdrawal',
      'query-direct',
    ])
      await expect(page.getByTestId(id)).toHaveCSS('color', color);
    await expect(page.getByTestId('query-withdrawal')).toHaveCSS(
      'opacity',
      '0.6',
    );
    await expect(page.getByTestId('query-withdrawal')).toHaveCSS(
      'border-top-width',
      '3px',
    );
    await page
      .getByRole('button', { name: 'Cycle query contribution' })
      .click();
  }
});

test('strict query conjunctions refine constituents while named priority stays explicit', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('query-refinement')).toHaveCSS(
    'color',
    'rgb(255, 165, 0)',
  );
  await expect(page.getByTestId('query-breakpoint')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
  await page.setViewportSize({ width: 550, height: 800 });
  await expect(page.getByTestId('query-refinement')).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
  await expect(page.getByTestId('query-breakpoint')).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
});

test('nested query normalization never moves interaction across selector targets', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('query-parent-padding').hover();
  await expect(page.getByTestId('query-parent-child')).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
  await page.getByTestId('query-child-padding').hover();
  await expect(page.getByTestId('query-child-child')).toHaveCSS(
    'color',
    'rgb(0, 0, 0)',
  );
  await page.getByTestId('query-child-child').hover();
  await expect(page.getByTestId('query-child-child')).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
});
