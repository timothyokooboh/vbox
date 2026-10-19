import { test, expect } from '../browser/fixtures';
import { mockMuseum } from './museum';

test('search, inspect and return preserves the gallery and trigger focus', async ({
  page,
}) => {
  await mockMuseum(page);
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'A little room for wonder.', level: 1 }),
  ).toBeVisible();
  await page
    .getByRole('searchbox', { name: 'Search art or artists' })
    .fill('Monet');
  await page
    .getByRole('button', { name: 'Search collection', exact: true })
    .click();
  const card = page.getByRole('button', {
    name: 'View Water Garden',
    exact: true,
  });
  await expect(card).toBeVisible();
  await card.click();
  const dialog = page.getByRole('dialog', { name: 'Water Garden' });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText('Oil on canvas', { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('link', { name: 'View museum record' }),
  ).toHaveAttribute('href', 'https://www.artic.edu/artworks/42');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
  await expect(page.getByRole('searchbox')).toHaveValue('Monet');
});

test('empty results retain the query and can reset to discovery', async ({
  page,
}) => {
  await mockMuseum(page);
  await page.route(
    'https://api.artic.edu/api/v1/artworks/search*',
    async (route) => {
      const params = JSON.parse(
        new URL(route.request().url()).searchParams.get('params')!,
      );
      if (params.query.bool.must[0].multi_match.query === 'Nothing')
        return route.fulfill({ json: { data: [], pagination: { total: 0 } } });
      return route.fallback();
    },
  );
  await page.goto('/');
  await page.getByRole('searchbox').fill('Nothing');
  await page.getByRole('searchbox').press('Enter');
  await expect(
    page.getByRole('heading', { name: 'No artworks found.' }),
  ).toBeVisible();
  await expect(page.getByRole('searchbox')).toHaveValue('Nothing');
  await page.getByRole('button', { name: 'Reset search' }).click();
  await expect(
    page.getByRole('button', { name: 'View Evening Study', exact: true }),
  ).toBeVisible();
});

test('a failed refresh retains cached artworks and an honest retry action', async ({
  page,
}) => {
  await mockMuseum(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Monet', exact: true }).click();
  const card = page.getByRole('button', {
    name: 'View Water Garden',
    exact: true,
  });
  await expect(card).toBeVisible();
  await page.getByRole('button', { name: 'Flowers', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'View Evening Study', exact: true }),
  ).toBeVisible();
  await page.clock.install();
  await page.clock.fastForward(61_000);
  await page.route('https://api.artic.edu/api/v1/artworks/search*', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.getByRole('button', { name: 'Monet', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await card.click();
  await expect(
    page.getByRole('dialog', { name: 'Water Garden' }),
  ).toBeVisible();
});

test('loading is announced and a newer submitted query cannot be replaced by a slow response', async ({
  page,
}) => {
  await mockMuseum(page);
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  const settled = new Promise<void>((resolve) => {
    const finish = (request: import('@playwright/test').Request) => {
      if (!request.url().startsWith('https://api.artic.edu/')) return;
      const params = JSON.parse(
        new URL(request.url()).searchParams.get('params')!,
      );
      if (params.query.bool.must[0].multi_match.query !== 'Slow') return;
      page.off('requestfinished', finish);
      page.off('requestfailed', finish);
      resolve();
    };
    page.on('requestfinished', finish);
    page.on('requestfailed', finish);
  });
  await page.route(
    'https://api.artic.edu/api/v1/artworks/search*',
    async (route) => {
      const query = JSON.parse(
        new URL(route.request().url()).searchParams.get('params')!,
      ).query.bool.must[0].multi_match.query;
      if (query === 'Slow') await ready;
      await route.fallback();
    },
  );
  try {
    await page.goto('/');
    const search = page.getByRole('searchbox');
    await search.fill('Slow');
    await search.press('Enter');
    await expect(
      page.getByRole('status', { name: 'Loading artworks' }),
    ).toBeVisible();
    await search.fill('Monet');
    await search.press('Enter');
    await expect(
      page.getByRole('button', { name: 'View Water Garden', exact: true }),
    ).toBeVisible();
    release();
    await settled;
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect(page.getByRole('status')).toContainText('Monet');
    await expect(
      page.getByRole('button', { name: 'View Evening Study', exact: true }),
    ).toHaveCount(0);
  } finally {
    release();
  }
});

test('initial service failure is honest and a retry can recover', async ({
  page,
}) => {
  await mockMuseum(page);
  let unavailable = true;
  await page.route('https://api.artic.edu/api/v1/artworks/search*', (route) =>
    unavailable ? route.fulfill({ status: 429, json: {} }) : route.fallback(),
  );
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'The collection is taking a moment.' }),
  ).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  unavailable = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('button', { name: 'View Evening Study', exact: true }),
  ).toBeVisible();
});

test('missing images and long metadata remain readable without injecting markup', async ({
  page,
}) => {
  await mockMuseum(page);
  await page.setViewportSize({ width: 320, height: 900 });
  const title = '<script>not executable</script> ' + 'Unbroken'.repeat(20);
  await page.route('https://api.artic.edu/api/v1/artworks/search*', (route) =>
    route.fulfill({
      json: {
        data: [{ id: 1, title, is_public_domain: true, image_id: null }],
        pagination: { total: 1 },
      },
    }),
  );
  await page.goto('/');
  const card = page.getByRole('button', { name: `View ${title}`, exact: true });
  await card.click();
  const dialog = page.getByRole('dialog', { name: title });
  await expect(
    dialog.getByRole('img', { name: `Image unavailable for ${title}` }),
  ).toBeVisible();
  await expect(
    dialog.getByText('Medium not recorded', { exact: true }),
  ).toBeVisible();
  expect(await dialog.locator('script').count()).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
});

test('withdrawn image URLs show a labelled fallback rather than a broken image', async ({
  page,
}) => {
  await mockMuseum(page);
  await page.route('https://www.artic.edu/iiif/2/fixture-1/**', (route) =>
    route.abort(),
  );
  await page.goto('/');
  await expect(
    page
      .getByRole('button', { name: 'View Evening Study', exact: true })
      .getByRole('img', { name: 'Image unavailable for Evening Study' }),
  ).toBeVisible();
});
