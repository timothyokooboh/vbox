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
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => { releaseScripts = resolve; });
  await page.route('**/*.js', async (route) => { await scriptsReady; await route.continue(); });
  try {
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
  } finally { releaseScripts(); }
});
