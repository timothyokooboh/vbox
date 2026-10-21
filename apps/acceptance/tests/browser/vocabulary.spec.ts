import { test, expect } from './fixtures';

test('CSS custom-property spelling remains case-sensitive end to end', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('custom-properties');
  await expect(target).toHaveCSS('width', '40px');
  await expect(target).toHaveCSS('height', '90px');
  await expect(target).not.toHaveAttribute('vb---Accent');
});

test('default/custom aliases, token references, compounds and dark values reach computed styles', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('aliases');
  await expect(target).toHaveCSS('color', 'rgb(18, 52, 86)');
  await expect(target).toHaveCSS('padding-left', '24px');
  await expect(target).toHaveCSS('width', '120px');
  await expect(target).toHaveCSS('max-width', '200px');
  await expect(target).toHaveCSS('border-top-color', 'rgb(18, 52, 86)');
  await expect(target).toHaveCSS('-webkit-user-select', 'none');
  await expect(target).toHaveClass(/acceptance-css-/);
  await expect(page.getByTestId('camel-alias')).toHaveCSS(
    'padding-left',
    '8px',
  );
  await page
    .locator('html')
    .evaluate((element) => element.classList.add('dark'));
  await expect(target).toHaveCSS('color', 'rgb(171, 205, 239)');
  await expect(target).toHaveCSS('border-top-color', 'rgb(171, 205, 239)');
  await expect(page.locator('body')).toHaveCSS('margin', '0px');
});
