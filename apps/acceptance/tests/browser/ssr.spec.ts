import { withDelayedScripts } from '../support/delayedScripts';
import { test, expect } from './fixtures';

test.describe('initial server styling', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 900, height: 800 } });
  test('dark bootstrap, reset, tokens and theme-first hover are effective before JavaScript', async ({ page }) => {
    await page.goto('/?ssr&theme=dark');
    await expect(page.locator('html')).toHaveClass('dark');
    await expect(page.locator('html')).not.toHaveAttribute('data-mounted');
    await expect(page.locator('body')).toHaveCSS('margin', '0px');
    await expect(page.getByTestId('polymorphic')).toHaveCSS('color', 'rgb(171, 205, 239)');
    await page.getByTestId('theme-hover').hover();
    await expect(page.getByTestId('theme-hover')).toHaveCSS('color', 'rgb(0, 0, 255)');
    await page.getByTestId('owner-button').hover();
    await expect(page.getByTestId('owner-button')).toHaveCSS('color', 'rgb(255, 0, 0)');
  });
});

test('delayed hydration preserves critical CSS and then supports overrides and lazy navigation', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'CSS', { value: undefined, configurable: true });
  });
  await withDelayedScripts(page, '**/*.js', async (releaseScripts) => {
    await page.goto('/?ssr&theme=dark&fixture=hydration', { waitUntil: 'commit' });
    const target = page.getByTestId('ssr-owned');
    await expect(page.locator('html')).not.toHaveAttribute('data-mounted');
    await expect(page.locator('body')).toHaveCSS('margin', '0px');
    await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
    await target.hover();
    await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
    await page.getByTestId('ssr-theme').hover();
    await expect(page.getByTestId('ssr-theme')).toHaveCSS('color', 'rgb(0, 0, 255)');
    const animation = await page.getByTestId('ssr-motion').evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).not.toBe('none');
    const initialClass = await target.getAttribute('class');
    releaseScripts();
    await expect(page.locator('html')).toHaveAttribute('data-mounted', 'true');
    await expect(target).toHaveAttribute('class', initialClass!);
    await expect(page.getByTestId('ssr-theme')).toHaveCSS('color', 'rgb(0, 0, 255)');
    await target.hover();
    await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(page.getByTestId('ssr-motion')).toHaveCSS('animation-name', animation);
    await page.getByRole('button', { name: 'Load styled route', exact: true }).click();
    await expect(page.getByTestId('ssr-lazy')).toHaveCSS('color', 'rgb(255, 255, 0)');
    await page.getByRole('button', { name: 'Withdraw hydrated override', exact: true }).click();
    await expect(target).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.getByTestId('ssr-lazy')).toHaveCSS('color', 'rgb(255, 255, 0)');
  });
});

for (const scenario of [
  { name: 'dark below md', width: 600, theme: 'dark', generic: 'rgb(0, 0, 255)', refined: 'rgb(0, 0, 255)' },
  { name: 'dark above md', width: 900, theme: 'dark', generic: 'rgb(0, 0, 255)', refined: 'rgb(255, 165, 0)' },
  { name: 'light above md', width: 900, theme: 'light', generic: 'rgb(0, 128, 0)', refined: 'rgb(0, 128, 0)' },
]) {
  test(`conditional priority survives delayed hydration: ${scenario.name}`, async ({ page }) => {
    await page.setViewportSize({ width: scenario.width, height: 800 });
    const assertConditions = async () => {
      await page.getByTestId('ssr-theme').hover();
      await expect(page.getByTestId('ssr-theme')).toHaveCSS('color', scenario.generic);
      await page.getByTestId('ssr-refined').hover();
      await expect(page.getByTestId('ssr-refined')).toHaveCSS('color', scenario.refined);
      await page.getByTestId('ssr-resting').hover();
      await expect(page.getByTestId('ssr-resting')).toHaveCSS('color', 'rgb(255, 0, 0)');
      await page.getByTestId('ssr-conditional-owner').hover();
      await expect(page.getByTestId('ssr-conditional-owner')).toHaveCSS('color', 'rgb(0, 0, 255)');
    };
    await withDelayedScripts(page, '**/*.js', async (release) => {
      await page.goto(`/?ssr&fixture=hydration&theme=${scenario.theme}`, { waitUntil: 'commit' });
      await expect(page.locator('html')).not.toHaveAttribute('data-mounted');
      await assertConditions();
      release();
      await expect(page.locator('html')).toHaveAttribute('data-mounted', 'true');
      await assertConditions();
      await page.getByRole('button', { name: 'Withdraw hydrated hover', exact: true }).click();
      await expect(page.getByTestId('ssr-conditional-owner')).toHaveCSS('color', 'rgb(255, 255, 0)');
      await page.getByTestId('ssr-conditional-owner').hover();
      await expect(page.getByTestId('ssr-conditional-owner')).toHaveCSS('color', 'rgb(255, 0, 0)');
    });
  });
}

test('setup-time raw theme overrides keep their priority through hydration', async ({ page }) => {
  await withDelayedScripts(page, '**/*.js', async (release) => {
    await page.goto('/?ssr&fixture=hydration', { waitUntil: 'commit' });
    await expect(page.locator('html')).not.toHaveAttribute('data-mounted');
    await expect(page.getByTestId('ssr-legacy')).toHaveCSS('color', 'rgb(102, 51, 153)');
    release();
    await expect(page.locator('html')).toHaveAttribute('data-mounted', 'true');
    await expect(page.getByTestId('ssr-legacy')).toHaveCSS('color', 'rgb(102, 51, 153)');
  });
});
