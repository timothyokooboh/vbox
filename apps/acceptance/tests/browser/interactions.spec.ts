import { test, expect } from './fixtures';

test('keyboard, pointer and disabled conflicts follow state priority rather than insertion order', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('interaction-priority');
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 0)');
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.getByTestId('interaction-start').focus();
  await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
  await expect(target).toHaveCSS('color', 'rgb(255, 165, 0)');
  await target.hover();
  await page.mouse.down();
  await expect(target).toHaveCSS('color', 'rgb(128, 0, 128)');
  await page.mouse.up();
  await page
    .getByRole('button', { name: 'Toggle interaction disabled' })
    .click();
  await target.hover();
  await expect(target).toBeDisabled();
  await expect(target).toHaveCSS('color', 'rgb(128, 128, 128)');
});

test('nested states use AND semantics without outranking a higher-priority single state', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const target = page.getByTestId('interaction-combined');
  await target.hover();
  await expect(target).toHaveCSS('opacity', '1');
  await target.focus();
  await expect(target).toHaveCSS('color', 'rgb(0, 128, 0)');
  await expect(target).toHaveCSS('opacity', '0.4');
  await page.mouse.down();
  await expect(target).toHaveCSS('color', 'rgb(128, 0, 128)');
  await page.mouse.up();
  await page.getByRole('button', { name: 'Withdraw state override' }).click();
  await target.hover();
  await target.focus();
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(target).toHaveCSS('opacity', '0.4');
  await page.getByRole('button', { name: 'Unset state override' }).click();
  await target.hover();
  await target.focus();
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
});

test('focus-within and focus retain their separate target semantics', async ({
  page,
}) => {
  await page.goto('/');
  const within = page.getByTestId('interaction-within');
  await within.hover();
  await expect(within).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.getByRole('textbox', { name: 'Nested focus input' }).focus();
  await expect(within).toHaveCSS('color', 'rgb(255, 215, 0)');
  const focus = page.getByTestId('interaction-focus');
  await focus.hover();
  await focus.focus();
  await expect(focus).toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(page.getByTestId('interaction-legacy')).toHaveCSS(
    'color',
    'rgb(0, 128, 0)',
  );
});

test('nested values and reversed registration stay isolated between targets', async ({
  page,
}) => {
  await page.goto('/');
  for (const reverse of [false, true]) {
    if (reverse)
      await page
        .getByRole('button', { name: 'Reverse interaction registration' })
        .click();
    for (const [name, value] of [
      ['red', 'rgb(255, 0, 0)'],
      ['blue', 'rgb(0, 0, 255)'],
    ]) {
      const target = page.getByTestId(`interaction-cache-${name}`);
      await target.hover();
      await target.focus();
      await expect(target).toHaveCSS('color', value);
      await target.evaluate((element) => {
        element.className = element.className.split(' ').reverse().join(' ');
      });
      await expect(target).toHaveCSS('color', value);
    }
  }
});
