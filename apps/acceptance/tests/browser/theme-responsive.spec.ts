import { test, expect } from './fixtures';

test('theme-first hover priority, explicit refinement and interaction-over-resting match the agreed examples', async ({
  page,
}) => {
  await page.setViewportSize({ width: 500, height: 800 });
  await page.goto('/');
  const target = page.getByTestId('theme-hover');
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.setViewportSize({ width: 900, height: 800 });
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(0, 128, 0)');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page.setViewportSize({ width: 500, height: 800 });
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page.setViewportSize({ width: 900, height: 800 });
  await page
    .getByRole('button', { name: 'Toggle combined refinement' })
    .click();
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 165, 0)');
  await page
    .getByRole('button', { name: 'Toggle combined refinement' })
    .click();
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  const resting = page.getByTestId('theme-resting');
  await expect(resting).toHaveCSS('color', 'rgb(0, 128, 0)');
  await resting.hover();
  await expect(resting).toHaveCSS('color', 'rgb(255, 0, 0)');
});

test('named breakpoint priority is independent of insertion order and partial config retains defaults', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const target = page.getByTestId('named-breakpoints');
  for (const [width, color] of [
    [500, 'rgb(0, 0, 0)'],
    [680, 'rgb(255, 0, 0)'],
    [780, 'rgb(255, 0, 0)'],
    [820, 'rgb(0, 128, 0)'],
    [1100, 'rgb(0, 0, 255)'],
    [1400, 'rgb(255, 165, 0)'],
    [1700, 'rgb(128, 0, 128)'],
  ] as const) {
    await page.setViewportSize({ width, height: 800 });
    await expect(target).toHaveCSS('color', color);
  }
});

test('matching thresholds use name order, not unit sorting, across independent app registrations', async ({
  page,
}) => {
  await page.setViewportSize({ width: 700, height: 800 });
  await page.goto('/');
  await expect(page.getByTestId('config-tied')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
  await expect(page.getByTestId('config-separate')).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
  await expect(page.getByTestId('config-reversed')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
  for (const name of ['separate', 'tied', 'reversed', 'tied']) {
    await page.getByTestId(`config-${name}`).click();
    await expect(page.getByTestId('config-tied')).toHaveCSS(
      'color',
      'rgb(0, 0, 255)',
    );
    await expect(page.getByTestId('config-separate')).toHaveCSS(
      'color',
      'rgb(255, 0, 0)',
    );
  }
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.getByTestId('config-reversed')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
});

test('clean and compatibility 2xl bindings share the configured threshold', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 800 });
  await page.goto('/');
  const target = page.getByTestId('clean-2xl');
  await expect(target).toHaveCSS('opacity', '1');
  await page.setViewportSize({ width: 1700, height: 800 });
  await expect(target).toHaveCSS('opacity', '0.5');
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
});

test('alternate declaration and condition nesting orders remain equivalent through updates', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto('/');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  for (const color of [
    'rgb(0, 0, 255)',
    'rgb(255, 165, 0)',
    'rgb(0, 0, 255)',
  ]) {
    for (const id of ['theme-hover', 'theme-reordered']) {
      const target = page.getByTestId(id);
      await target.hover();
      await expect(target).toHaveCSS('color', color);
    }
    await page
      .getByRole('button', { name: 'Toggle combined refinement' })
      .click();
  }
});
