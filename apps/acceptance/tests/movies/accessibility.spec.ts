import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../browser/fixtures';
import { mockTmdb } from './tmdb';
import { mockArtwork } from './artwork';

for (const theme of ['dark', 'light']) {
  test(`home, search and details pass automated WCAG checks in ${theme} mode`, async ({
    page,
  }, testInfo) => {
    await mockTmdb(page);
    await mockArtwork(page);
    await page.route(
      'https://api.themoviedb.org/3/movie/101/videos*',
      (route) => route.fulfill({ json: { id: 101, results: [] } }),
    );
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Signal', level: 1 }),
    ).toBeVisible();
    if (theme === 'light') await page.getByRole('switch').click();
    const scan = async (state: string) => {
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      await testInfo.attach(state, {
        body: JSON.stringify(result, null, 2),
        contentType: 'application/json',
      });
      expect(result.violations).toEqual([]);
    };
    await scan('home');
    await page.getByRole('button', { name: 'Open movie search' }).click();
    await scan('search');
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: 'View Details', exact: true }).click();
    await expect(
      page.getByText('Follow the signal.', { exact: true }),
    ).toBeVisible();
    await scan('details');
    await page.getByRole('button', { name: 'Play trailer for Signal' }).click();
    await expect(
      page.getByText(
        'No playable trailer is available for this title right now.',
      ),
    ).toBeVisible();
    await scan('trailer');
  });
}
