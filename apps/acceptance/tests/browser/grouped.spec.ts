import { test, expect } from './fixtures';

test('typed objects attach without semantic translate collisions and replace reactively', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('grouped');
  await expect(target).toHaveAttribute('translate', 'no');
  await expect(target).toHaveCSS('translate', '8px');
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await expect(target).not.toHaveAttribute('vb');
  await page.getByRole('button', { name: 'Replace grouped' }).click();
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(target).toHaveCSS('opacity', '0');
  await page.getByRole('button', { name: 'Clear grouped' }).click();
  await expect(target).toHaveCSS('opacity', '1');
  await expect(target).toHaveCSS('translate', 'none');
});

test('PVA defaults, variants and compounds style a real native button', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('grouped-pva');
  await expect(target).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  await expect(target).toHaveCSS('padding-left', '4px');
  await page.getByRole('button', { name: 'Change variants' }).click();
  await expect(target).toHaveCSS('color', 'rgb(18, 52, 86)');
  await expect(target).toHaveCSS('padding-left', '12px');
  await expect(target).toHaveCSS('border-top-width', '2px');
  await expect(target).toHaveCSS('border-top-color', 'rgb(18, 52, 86)');
});

test('dynamic keys belong in :vb while ordinary object spreads retain Vue meaning', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('dynamic-style-key');
  await expect(target).toHaveCSS('width', '44px');
  await page.getByRole('button', { name: 'Change property' }).click();
  await expect(target).toHaveCSS('height', '44px');
  await expect(target).not.toHaveCSS('width', '44px');
  const semantic = page.getByTestId('ordinary-style-object');
  await expect(semantic).toHaveAttribute('color', 'red');
  await expect(semantic).toHaveAttribute('width', '99px');
  await expect(semantic).toHaveAttribute('vb-height', '33px');
  await expect(semantic).not.toHaveCSS('color', 'rgb(255, 0, 0)');
  await expect(semantic).not.toHaveCSS('width', '99px');
});

test('grouped objects survive hydration and support undefined and explicit resets', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const target = page.getByTestId('grouped');
  await expect(target).toHaveCSS('translate', '8px');
  await page.getByRole('button', { name: 'Unset grouped' }).click();
  await expect(target).toHaveCSS('translate', 'none');
  await page.getByRole('button', { name: 'Reset grouped' }).click();
  await expect(target).toHaveCSS('opacity', '1');
});
