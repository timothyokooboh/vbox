import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import { test, expect } from '../browser/fixtures';
import { mockMuseum } from './museum';

for (const width of [320, 390, 768, 1440]) {
  test(`gallery is usable and readable in both themes at ${width}px`, async ({
    page,
  }, testInfo) => {
    await mockMuseum(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: 'View Evening Study', exact: true }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark')
        await page.getByRole('switch', { name: 'Dark theme' }).click();
      await expect(page.getByRole('main')).toHaveCSS(
        'color',
        theme === 'dark' ? 'rgb(237, 236, 225)' : 'rgb(35, 56, 45)',
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const scan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      await testInfo.attach(`${width}-${theme}-axe`, {
        body: JSON.stringify(scan),
        contentType: 'application/json',
      });
      expect(scan.violations).toEqual([]);
      const evidence = process.env.ATELIER_EVIDENCE_DIR;
      if (
        evidence &&
        testInfo.project.name === 'atelier-chromium' &&
        [390, 1440].includes(width)
      ) {
        await mkdir(evidence, { recursive: true });
        await page.screenshot({
          path: `${evidence}/${width}-${theme}.png`,
          animations: 'disabled',
          fullPage: true,
        });
      }
    }
    await page.reload();
    await expect(
      page.getByRole('switch', { name: 'Dark theme' }),
    ).toHaveAttribute('aria-checked', 'true');
    await page.getByRole('button', { name: 'Monet', exact: true }).click();
    const titles = page.getByRole('heading', { level: 3 });
    await expect(titles).toHaveText(['Water Garden', 'Morning Light']);
    await page.getByRole('switch', { name: 'Dark theme' }).click();
    await expect(page.getByRole('main')).toHaveCSS('color', 'rgb(35, 56, 45)');
    await expect(page.getByRole('searchbox')).toHaveValue('Monet');
    await expect(titles).toHaveText(['Water Garden', 'Morning Light']);
  });
}

test('keyboard users can skip, search, inspect and close a focus-trapped dialog', async ({
  page,
}, testInfo) => {
  await mockMuseum(page, 'auto');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('searchbox').fill('Monet');
  await page.getByRole('searchbox').press('Enter');
  const card = page.getByRole('button', {
    name: 'View Water Garden',
    exact: true,
  });
  await card.focus();
  await expect(card).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Water Garden' });
  await expect(dialog).toBeVisible();
  for (const theme of ['light', 'dark']) {
    // Operating-system theme changes must not dismiss an open dialog.
    if (theme === 'dark') await page.emulateMedia({ colorScheme: 'dark' });
    await expect(dialog).toHaveCSS(
      'background-color',
      theme === 'dark' ? 'rgb(19, 28, 24)' : 'rgb(244, 241, 233)',
    );
    await expect(
      dialog.getByText('Oil on canvas', { exact: true }),
    ).toBeVisible();
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    await testInfo.attach(`details-${theme}-axe`, {
      body: JSON.stringify(scan),
      contentType: 'application/json',
    });
    expect(scan.violations).toEqual([]);
  }
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(card).toBeFocused();
});

test('caller styling on suggestion buttons preserves focus/hover defaults and withdraws', async ({
  page,
}) => {
  await mockMuseum(page);
  await page.goto('/');
  const monet = page.getByRole('button', { name: 'Monet', exact: true });
  await monet.click();
  await page.mouse.move(0, 0);
  await expect(monet).toHaveCSS('background-color', 'rgb(40, 78, 57)');
  await monet.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(monet).toBeFocused();
  await expect(monet).toHaveCSS('outline-color', 'rgb(138, 53, 30)');
  await monet.hover();
  await expect(monet).toHaveCSS('background-color', 'rgb(35, 56, 45)');
  await page.getByRole('button', { name: 'Flowers', exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(monet).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

for (const mode of ['reduced', 'touch'] as const) {
  test.describe(mode, () => {
    test.use(
      mode === 'touch' ? { hasTouch: true } : { reducedMotion: 'reduce' },
    );
    test('artwork hover does not move content', async ({ page }) => {
      await mockMuseum(page);
      await page.goto('/');
      const card = page.getByRole('button', {
        name: 'View Evening Study',
        exact: true,
      });
      await card.hover();
      await expect(card).toHaveCSS('transform', 'none');
      for (const control of [
        page.getByRole('switch'),
        page.getByRole('button', { name: 'Search collection', exact: true }),
      ]) {
        const rect = await control.boundingBox();
        expect(rect!.width).toBeGreaterThanOrEqual(44);
        expect(rect!.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
}
