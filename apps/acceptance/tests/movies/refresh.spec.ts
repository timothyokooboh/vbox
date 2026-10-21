import { test, expect } from '../browser/fixtures';
import { mockTmdb, movie } from './tmdb';

// Exercise real query-cache behavior through navigation and the HTTP boundary.
test('a failed collection refresh keeps previously loaded movies usable', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.clock.install();
  await page.goto('/');
  const popular = page.getByRole('region', { name: 'Popular', exact: true });
  await expect(popular.getByRole('link', { name: /Signal/ })).toBeVisible();
  await page.getByRole('link', { name: 'View Details', exact: true }).click();
  await expect(
    page.getByText('Follow the signal.', { exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(61_000);
  await page.route('https://api.themoviedb.org/3/movie/popular*', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.getByRole('link', { name: /Back to Home/ }).click();
  await expect(
    popular.getByText('Could not refresh these titles. Showing saved results.'),
  ).toBeVisible({ timeout: 15_000 });
  await popular.getByRole('link', { name: /Signal/ }).click();
  await expect(
    page.getByText('Follow the signal.', { exact: true }),
  ).toBeVisible();
});

test('a failed search refresh keeps previously loaded matches usable', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open movie search' }).click();
  const search = page.getByRole('searchbox');
  await search.fill('Matrix');
  const result = page
    .getByRole('dialog')
    .getByRole('link', { name: /Matrix Station/ });
  await expect(result).toBeVisible();
  await search.fill('');
  await expect(
    page.getByText('Start with a movie title.', { exact: false }),
  ).toBeVisible();
  await page.route('https://api.themoviedb.org/3/search/movie*', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await search.fill('Matrix');
  await expect(
    page.getByText('Could not refresh your search. Showing saved results.'),
  ).toBeVisible({ timeout: 15_000 });
  await result.click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Matrix Station', level: 1 }),
  ).toBeVisible();
});

for (const width of [390, 1440]) {
  test(`loading a full collection preserves the following section position at ${width}px`, async ({
    page,
  }) => {
    await mockTmdb(page);
    await page.setViewportSize({ width, height: 1000 });
    let release!: () => void;
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      'https://api.themoviedb.org/3/movie/popular*',
      async (route) => {
        await ready;
        await route.fulfill({
          json: {
            page: 1,
            total_pages: 1,
            total_results: 10,
            results: Array.from({ length: 10 }, (_, index) => ({
              ...movie,
              id: 101 + index,
            })),
          },
        });
      },
    );
    try {
      await page.goto('/');
      await expect(
        page.getByRole('status', { name: 'Loading popular' }),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const following = page.getByRole('region', {
        name: 'Top Rated',
        exact: true,
      });
      const before = await following.boundingBox();
      release();
      await expect(
        page
          .getByRole('region', { name: 'Popular', exact: true })
          .getByRole('article'),
      ).toHaveCount(10);
      const after = await following.boundingBox();
      expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(1);
    } finally {
      release();
    }
  });
}
