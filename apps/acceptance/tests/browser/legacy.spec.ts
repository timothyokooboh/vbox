import { expect, test } from './fixtures';

test('published hover styling changes the actual rendered button', async ({
  page,
}) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Hover baseline' });
  await button.hover();
  await expect(button).toHaveCSS('color', 'rgb(0, 128, 0)');
});

test('polymorphism, aliases, and tokens preserve the semantic element', async ({
  page,
}) => {
  await page.goto('/');
  const paragraph = page.getByTestId('polymorphic');
  await expect(paragraph).toHaveJSProperty('tagName', 'P');
  await expect(paragraph).toHaveCSS('color', 'rgb(18, 52, 86)');
  await expect(paragraph).toHaveCSS('padding-left', '12px');
});

test('asChild styles its actual child without inserting a wrapper', async ({
  page,
}) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Adopted link' });
  await expect(link).toHaveAttribute('href', '#content');
  await expect(link).toHaveCSS('color', 'rgb(128, 0, 128)');
  await expect(page.locator('main > a')).toHaveCount(1);
});

test('a framework-independent PVA result styles the published component', async ({
  page,
}) => {
  await page.goto('/');
  const badge = page.getByTestId('pva');
  await expect(badge).toHaveCSS('background-color', 'rgb(0, 128, 0)');
  await expect(badge).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('ordinary native attributes stay semantic even without explicit styling nearby', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('semantic-unprefixed');
  await expect(target).toHaveAttribute('color', 'red');
  await expect(target).not.toHaveCSS('color', 'rgb(255, 0, 0)');
});

test('server HTML hydrates and remains interactive without mismatches', async ({
  page,
}, testInfo) => {
  const start = performance.now();
  await page.goto('/?ssr');
  await expect(page.locator('html')).toHaveAttribute('data-mounted', 'true');
  await expect(page.getByTestId('polymorphic')).toHaveCSS(
    'color',
    'rgb(18, 52, 86)',
  );
  await page.getByRole('button', { name: 'Count 0' }).click();
  await expect(page.getByRole('button', { name: 'Count 1' })).toBeVisible();
  await testInfo.attach('runtime-baseline', {
    body: JSON.stringify({
      navigationHydrationAndClickMs: performance.now() - start,
    }),
    contentType: 'application/json',
  });
});

test.describe('before client JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('SSR delivers effective critical styles including hover', async ({
    page,
  }) => {
    await page.goto('/?ssr');
    await expect(page.locator('html')).not.toHaveAttribute('data-mounted');
    await expect(page.getByTestId('polymorphic')).toHaveCSS(
      'color',
      'rgb(18, 52, 86)',
    );
    const button = page.getByRole('button', { name: 'Hover baseline' });
    await button.hover();
    await expect(button).toHaveCSS('color', 'rgb(0, 128, 0)');
  });
});
