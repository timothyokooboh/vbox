import { withDelayedScripts } from '../support/delayedScripts';
import { test, expect } from '../browser/fixtures';

test.describe('Nuxt before JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('critical tokens, resets, owner defaults and theme-first hover reach the initial HTML', async ({ page }) => {
    await page.goto('/?theme=dark');
    await expect(page.locator('html')).toHaveClass('dark');
    await expect(page.locator('body')).toHaveCSS('margin', '0px');
    await expect(page.getByTestId('nuxt-token')).toHaveCSS('color', 'rgb(171, 205, 239)');
    await expect(page.getByTestId('nuxt-owner')).toHaveCSS('color', 'rgb(255, 255, 0)');
    await page.getByTestId('nuxt-owner').hover();
    await expect(page.getByTestId('nuxt-owner')).toHaveCSS('color', 'rgb(255, 0, 0)');
    await page.getByTestId('nuxt-theme').hover();
    await expect(page.getByTestId('nuxt-theme')).toHaveCSS('color', 'rgb(0, 0, 255)');
    const hasAnimation = await page.getByTestId('nuxt-motion').evaluate((el) => {
      const name = getComputedStyle(el).animationName;
      return Array.from(document.styleSheets).some((sheet) =>
        Array.from(sheet.cssRules).some((rule) => rule instanceof CSSKeyframesRule && rule.name === name),
      );
    });
    expect(hasAnimation).toBe(true);
  });
});

test('Nuxt hydrates after delayed scripts, then updates owners and navigates themes without mismatches', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(CSS, 'supports', { value: () => false }); });
  await withDelayedScripts(page, '**/_nuxt/**', async (releaseScripts) => {
    await page.goto('/?theme=dark', { waitUntil: 'commit' });
    const owner = page.getByTestId('nuxt-owner');
    await expect(page.locator('html')).not.toHaveAttribute('data-nuxt-mounted');
    await expect(owner).toHaveCSS('color', 'rgb(255, 255, 0)');
    await owner.hover();
    await expect(owner).toHaveCSS('color', 'rgb(255, 0, 0)');
    const animation = await page.getByTestId('nuxt-motion').evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).not.toBe('none');
    const initialClass = await owner.getAttribute('class');
    releaseScripts();
    await expect(page.locator('html')).toHaveAttribute('data-nuxt-mounted', 'true');
    await expect(owner).toHaveAttribute('class', initialClass!);
    await expect(owner).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(page.getByTestId('nuxt-motion')).toHaveCSS('animation-name', animation);
    await page.getByRole('button', { name: 'Withdraw Nuxt override', exact: true }).click();
    await expect(owner).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.getByRole('link', { name: 'Light route', exact: true }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.getByTestId('nuxt-token')).toHaveCSS('color', 'rgb(18, 52, 86)');
    await page.getByTestId('nuxt-theme').hover();
    await expect(page.getByTestId('nuxt-theme')).toHaveCSS('color', 'rgb(0, 128, 0)');
    await page.getByRole('link', { name: 'Dark route', exact: true }).click();
    await expect(page.getByTestId('nuxt-token')).toHaveCSS('color', 'rgb(171, 205, 239)');
    await page.getByTestId('nuxt-theme').hover();
    await expect(page.getByTestId('nuxt-theme')).toHaveCSS('color', 'rgb(0, 0, 255)');
    await page.getByRole('button', { name: 'Restore Nuxt override', exact: true }).click();
    await expect(owner).toHaveCSS('color', 'rgb(255, 255, 0)');
    await owner.hover();
    await expect(owner).toHaveCSS('color', 'rgb(255, 0, 0)');
  });
});
