declare global {
  interface Window {
    __moviesTransitionCalls: number;
  }
}

import { mkdir } from 'node:fs/promises';
import { test, expect } from '../browser/fixtures';
import { mockTmdb } from './tmdb';
import { mockArtwork } from './artwork';

for (const width of [390, 1440]) {
  test(`cinema layout remains usable at ${width}px`, async ({
    page,
  }, testInfo) => {
    await mockTmdb(page);
    await mockArtwork(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Signal', level: 1 }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    // Finish initial presentation before recording the static visual evidence.
    await expect
      .poll(() =>
        page
          .getByRole('heading', { name: 'Signal', level: 1 })
          .evaluate((e) => getComputedStyle(e).opacity),
      )
      .toBe('1');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const theme of ['dark', 'light']) {
      if (theme === 'light') await page.getByRole('switch').click();
      const path = process.env.MOVIES_EVIDENCE_DIR;
      if (path) {
        await mkdir(path, { recursive: true });
        await page.screenshot({
          path: `${path}/${width}-${theme}.png`,
          animations: 'disabled',
        });
      } else {
        await testInfo.attach(`${width}-${theme}`, {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        });
      }
    }
  });
}

test('reduced motion keeps cards stationary on hover', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockTmdb(page);
  await page.goto('/');
  const card = page.getByRole('article').first();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  await expect
    .poll(() =>
      card.evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === 'running').length,
      ),
    )
    .toBe(0);
});

test('keyboard users can skip navigation and open search without losing visible focus', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('button', { name: 'Open movie search' }).focus();
  await expect(
    page.getByRole('button', { name: 'Open movie search' }),
  ).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('searchbox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'Open movie search' }),
  ).toBeFocused();
});

test('card feedback is brief, interruptible and does not disturb neighboring layout', async ({
  page,
}) => {
  await mockTmdb(page);
  await mockArtwork(page);
  await page.goto('/');
  const cards = page.getByRole('article');
  const first = cards.first();
  const neighbor = cards.nth(1);
  await first.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const before = await neighbor.boundingBox();
  await first.hover();
  await expect
    .poll(() => first.evaluate((e) => getComputedStyle(e).transform))
    .not.toBe('none');
  expect(
    await first.evaluate((e) =>
      Math.max(
        ...getComputedStyle(e)
          .transitionDuration.split(',')
          .map(Number.parseFloat),
      ),
    ),
  ).toBeLessThanOrEqual(0.25);
  await page.mouse.move(0, 0);
  await expect(first).toHaveCSS('transform', 'none');
  expect(await neighbor.boundingBox()).toEqual(before);
});

for (const input of ['keyboard', 'reduced motion']) {
  test(`${input} navigation does not start view transitions`, async ({
    page,
  }) => {
    await mockTmdb(page);
    if (input === 'reduced motion')
      await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const start = document.startViewTransition?.bind(document);
      window.__moviesTransitionCalls = 0;
      if (start)
        document.startViewTransition = ((update) => {
          window.__moviesTransitionCalls++;
          return start(update);
        }) as typeof document.startViewTransition;
    });
    await page.goto('/');
    const details = page.getByRole('link', {
      name: 'View Details',
      exact: true,
    });
    await expect(details).toBeVisible();
    const initial = await page.evaluate(() => window.__moviesTransitionCalls);
    if (input === 'keyboard') {
      await details.focus();
      await page.keyboard.press('Enter');
    } else await details.click();
    await expect(
      page.getByText('Follow the signal.', { exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => window.__moviesTransitionCalls)).toBe(
      initial,
    );
  });
}

test('loading details expose a named status while decorative placeholders stay hidden', async ({
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
    await expect(
      page.getByRole('status', { name: 'Loading movie details' }),
    ).toBeVisible();
    release();
    await expect(
      page.getByRole('heading', { name: 'Signal', level: 1 }),
    ).toBeVisible();
  } finally {
    release();
  }
});

test('empty collections have a useful state rather than disappearing', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.route('https://api.themoviedb.org/3/movie/popular*', (route) =>
    route.fulfill({
      json: { page: 1, total_pages: 1, total_results: 0, results: [] },
    }),
  );
  await page.goto('/');
  await expect(
    page
      .getByRole('region', { name: 'Popular', exact: true })
      .getByText('No titles available right now.'),
  ).toBeVisible();
});

test('pointer navigation uses progressive view transitions without duplicate names', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.addInitScript(() => {
    const start = document.startViewTransition?.bind(document);
    window.__moviesTransitionCalls = 0;
    if (start)
      document.startViewTransition = ((update) => {
        window.__moviesTransitionCalls++;
        return start(update);
      }) as typeof document.startViewTransition;
  });
  await page.goto('/');
  const supported = await page.evaluate(
    () => typeof document.startViewTransition === 'function',
  );
  const names = await page
    .locator('*')
    .evaluateAll((elements) =>
      elements
        .map((e) => getComputedStyle(e).viewTransitionName)
        .filter((name) => name && name !== 'none' && name !== 'match-element'),
    );
  expect(new Set(names).size).toBe(names.length);
  await page.getByRole('link', { name: 'View Details', exact: true }).click();
  await expect(
    page.getByText('Follow the signal.', { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__moviesTransitionCalls)).toBe(
    supported ? 1 : 0,
  );
  await page.getByRole('link', { name: /Back to Home/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Signal', level: 1 }),
  ).toBeVisible();
});

test('navigation still works when the browser has no view-transition API', async ({
  page,
}) => {
  await mockTmdb(page);
  await page.addInitScript(() => {
    let target: object | null = document;
    while (target) {
      if (Object.hasOwn(target, 'startViewTransition'))
        Reflect.deleteProperty(target, 'startViewTransition');
      target = Object.getPrototypeOf(target);
    }
  });
  await page.goto('/');
  expect(await page.evaluate(() => 'startViewTransition' in document)).toBe(
    false,
  );
  await page.getByRole('link', { name: 'View Details', exact: true }).click();
  await expect(
    page.getByText('Follow the signal.', { exact: true }),
  ).toBeVisible();
});

test.describe('touch input', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('cards do not get stuck in hover enlargement and controls have comfortable targets', async ({
    page,
  }) => {
    await mockTmdb(page);
    await page.goto('/');
    const card = page.getByRole('article').first();
    await card.hover();
    await expect(card).toHaveCSS('transform', 'none');
    await page.evaluate(() => scrollTo(0, 0));
    for (const control of [
      page.getByRole('switch'),
      page.getByRole('button', { name: 'Open movie search' }),
    ]) {
      const rect = await control.boundingBox();
      expect(rect?.width).toBeGreaterThanOrEqual(44);
      expect(rect?.height).toBeGreaterThanOrEqual(44);
    }
  });
});
