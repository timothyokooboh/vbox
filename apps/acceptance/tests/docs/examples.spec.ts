import { withDelayedScripts } from '../support/delayedScripts';
import { test, expect } from '../browser/fixtures';

test.describe('documentation before JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the introductory example is styled in the initial HTML', async ({
    page,
  }) => {
    await page.goto('/guide/introduction.html');
    const example = page
      .getByRole('paragraph')
      .filter({ hasText: 'Hello world 🎉' });
    await expect(example).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(example).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(example).toHaveCSS('padding', '16px');
    await expect(page.locator('head style#vbox-ssr')).toHaveCount(1);
  });
});

test('the product demo renders on the server and its semantic quantity controls hydrate', async ({
  page,
}) => {
  await withDelayedScripts(page, '**/assets/*.js', async (releaseScripts) => {
    await page.goto('/demos/product-card.html', { waitUntil: 'commit' });
    const card = page.locator('[data-scope="product-card"]');
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS('max-width', '400px');
    const quantity = page.getByRole('group', { name: 'Quantity', exact: true });
    await expect(quantity).toBeVisible();
    releaseScripts();
    await page.waitForLoadState('load');
    const add = quantity.getByRole('button', { name: 'add', exact: true });
    const remove = quantity.getByRole('button', {
      name: 'remove',
      exact: true,
    });
    await expect(remove).toBeDisabled();
    for (let i = 0; i < 4; i++) await add.click();
    await expect(add).toBeDisabled();
    await remove.click();
    await expect(add).toBeEnabled();
  });
});

test('the forwarding example preserves semantic props and internal hover while callers withdraw', async ({
  page,
}) => {
  await page.goto('/guide/essentials/component-targets.html');
  const button = page.getByRole('button', { name: 'Save draft', exact: true });
  await expect(button).toHaveAttribute('data-tone', 'primary');
  await expect(button).toHaveAttribute('data-size', 'large');
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 0)');
  await expect(button).toHaveCSS('padding', '16px');
  await button.hover();
  await expect(button).toHaveCSS('color', 'rgb(255, 0, 0)');
  await button.click();
  await expect(page.getByRole('status')).toHaveText('Saved 1');
  await page.getByRole('button', { name: 'Withdraw caller color' }).click();
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(
    page.getByText('Saves the current draft.', { exact: true }),
  ).not.toHaveCSS('color', 'rgb(255, 255, 0)');
});

test('the priority example demonstrates theme-first hover and explicit refinement', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto('/guide/essentials/style-priority.html');
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  const button = page.getByRole('button', {
    name: 'Compare conditions',
    exact: true,
  });
  await button.hover();
  await expect(button).toHaveCSS('color', 'rgb(0, 128, 0)');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(button).toHaveCSS('color', 'rgb(0, 0, 255)');
  const interaction = page.getByRole('button', { name: 'Interaction wins' });
  await interaction.hover();
  await expect(interaction).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page
    .getByRole('checkbox', { name: 'Refine dark + md + hover' })
    .check();
  await button.hover();
  await expect(button).toHaveCSS('color', 'rgb(128, 0, 128)');
  await page.setViewportSize({ width: 600, height: 900 });
  await button.hover();
  await expect(button).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await expect(button).toHaveCSS('color', 'rgb(255, 0, 0)');
});

test.describe('documented keyframes', () => {
  test.use({ javaScriptEnabled: false });
  test('the initial stylesheet includes the example animation and respects reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/guide/essentials/keyframes.html');
    const example = page
      .getByRole('paragraph')
      .filter({ hasText: /VBox is cool/ });
    const animation = await example.evaluate(
      (element) => getComputedStyle(element).animationName,
    );
    expect(animation).not.toBe('none');
    const names = await page
      .locator('head style#vbox-ssr')
      .evaluate((element) =>
        [...(element as HTMLStyleElement).sheet!.cssRules]
          .filter((rule) => rule.type === CSSRule.KEYFRAMES_RULE)
          .map((rule) => (rule as CSSKeyframesRule).name),
      );
    expect(names).toContain(animation);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(example).toHaveCSS('animation-name', 'none');
  });
});
