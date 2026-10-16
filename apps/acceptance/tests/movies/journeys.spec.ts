import { test, expect } from '../browser/fixtures';
import { mockTmdb } from './tmdb';

test('the home screen retains its semantic links, theme colors and native button styling', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Signal', level: 1 }),
  ).toBeVisible();
  const details = page.getByRole('link', { name: 'View Details', exact: true });
  await expect(details).toHaveAttribute('href', '/movie/101');
  await expect(details).toHaveCSS('background-color', 'rgb(229, 9, 20)');
  await expect(details).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(
    page.getByRole('navigation', { name: 'Top navigation' }),
  ).toBeVisible();
  await page.getByRole('switch', { name: 'Toggle color scheme' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(details).toHaveCSS('background-color', 'rgb(209, 19, 30)');
});

test('search waits 1500 ms after the latest input and selecting a result closes the dialog', async ({
  page,
}) => {
  const api = await mockTmdb(page);
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Signal', level: 1 }),
  ).toBeVisible();
  await page.clock.runFor(2500);
  await page.getByRole('button', { name: 'Open movie search' }).click();
  const dialog = page.getByRole('dialog', { name: 'Search Movies' });
  const input = dialog.getByRole('searchbox', { name: 'Search Query' });
  await expect(input).toBeFocused();
  await input.fill('Matri');
  await page.clock.runFor(1000);
  expect(api.searchQueries).toEqual([]);
  await input.fill('Matrix');
  await page.clock.runFor(1499);
  expect(api.searchQueries).toEqual([]);
  await page.clock.runFor(1);
  await expect.poll(() => api.searchQueries).toEqual(['Matrix']);
  await dialog.getByRole('link', { name: /Matrix Station/ }).click();
  await page.clock.runFor(500);
  await expect(page).toHaveURL(/\/movie\/202$/);
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Matrix Station', level: 1 }),
  ).toBeVisible();
});

test('search closes with Escape and returns focus to its trigger', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open movie search' });
  await trigger.click();
  await expect(
    page.getByRole('dialog', { name: 'Search Movies' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('the search dialog is layered above the sticky header', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.goto('/');
  const headerLayer = await page
    .getByRole('banner')
    .evaluate((element) => Number(getComputedStyle(element).zIndex));
  await page.getByRole('button', { name: 'Open movie search' }).click();
  const dialog = page.getByRole('dialog', { name: 'Search Movies' });
  await expect
    .poll(() =>
      dialog.evaluate((element) => Number(getComputedStyle(element).zIndex)),
    )
    .toBeGreaterThan(headerLayer);
});

test('a direct movie URL renders the detail route in production as well as development', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.goto('/movie/101');
  await expect(
    page.getByRole('heading', { name: 'Signal', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByText('Follow the signal.', { exact: true }),
  ).toBeVisible();
});

test('the trailer dialog shows a playable embed and closing it removes playback and restores focus', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.route('https://api.themoviedb.org/3/movie/101/videos*', (route) =>
    route.fulfill({
      json: {
        id: 101,
        results: [
          {
            id: 'trailer-1',
            key: 'public-demo',
            name: 'Official Trailer',
            site: 'YouTube',
            type: 'Trailer',
            official: true,
            iso_639_1: 'en',
            iso_3166_1: 'US',
            published_at: '2025-05-01T00:00:00Z',
          },
        ],
      },
    }),
  );
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Play trailer for Signal' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Signal Trailer' });
  const player = dialog.locator('iframe');
  await expect(player).toHaveAttribute(
    'src',
    /youtube-nocookie\.com\/embed\/public-demo\?/,
  );
  await expect(player).toHaveAttribute('title', 'Signal trailer player');
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(player).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('movie details show skeletons while fetching, then the returned content', async ({
  page,
}) => {
  await mockTmdb(page);
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/3\/movie\/101\?/, async (route) => {
    await ready;
    await route.fallback();
  });
  try {
    await page.goto('/movie/101');
    const loading = page.locator('main [aria-busy="true"]');
    await expect(loading).toBeVisible();
    await expect(loading.locator('.movie-skeleton').first()).toHaveCSS(
      'height',
      '416px',
    );
    release();
    await expect(
      page.getByRole('heading', { name: 'Signal', level: 1 }),
    ).toBeVisible();
    await expect(loading).toHaveCount(0);
  } finally {
    release();
  }
});

test('an unavailable detail response leaves a useful fallback and a working home link', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.route(/\/3\/movie\/101\?/, (route) =>
    route.fulfill({
      status: 503,
      json: { status_message: 'Temporarily unavailable' },
    }),
  );
  await page.goto('/movie/101');
  await expect(
    page.getByText('Movie details unavailable.', { exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await page.getByRole('link', { name: /Back to Home/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Signal', level: 1 }),
  ).toBeVisible();
});

test('mobile header controls stay usable and caller-responsive button styling survives internal defaults', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Signal', level: 1 }),
  ).toBeVisible();
  const attribution = page.getByText('TMDB Attribution', { exact: true });
  await expect(attribution).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'VBox Movies', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('switch', { name: 'Toggle color scheme' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Open movie search' }).click();
  await expect(
    page.getByRole('searchbox', { name: 'Search Query' }),
  ).toBeFocused();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Close', exact: true })
    .click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(attribution).toBeVisible();
  await attribution.hover();
  await expect(attribution).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('a movie with no playable trailer presents a clear empty state', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.route('https://api.themoviedb.org/3/movie/101/videos*', (route) =>
    route.fulfill({ json: { id: 101, results: [] } }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Play trailer for Signal' }).click();
  await expect(
    page
      .getByRole('dialog')
      .getByText('No playable trailer is available for this title right now.'),
  ).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
});
