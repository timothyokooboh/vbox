import { test, expect } from './fixtures';

test('single-root callers override matching base/state contexts and withdrawal reveals internal styling', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('owner-button');
  await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
  await expect(target).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await expect(target).toHaveCSS('background-color', 'rgb(128, 0, 128)');
  await page.getByRole('button', { name: 'Toggle caller hover' }).click();
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page.getByRole('button', { name: 'Toggle caller hover' }).click();
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.getByRole('button', { name: 'Toggle caller base' }).click();
  await page.mouse.move(0, 0);
  await expect(target).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('legitimate props, merged classes/styles, listeners, model, refs and slots survive without wrappers', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const target = page.getByTestId('owner-button');
  await expect(target).toHaveAttribute('data-semantic-color', 'semantic-green');
  await expect(target).toHaveAttribute('data-semantic-size', 'large');
  await expect(target).toHaveAttribute('data-semantic-width', '123');
  await expect(target).toHaveClass(/button-internal/);
  await expect(target).toHaveClass(/button-caller/);
  await expect(target).toHaveClass(/caller-active/);
  await expect(target).toHaveCSS('font-weight', '500');
  await expect(target).toHaveCSS('font-style', 'italic');
  expect(
    await target.evaluate((el) => [
      el.tagName,
      el.parentElement?.tagName,
      el.querySelector('span')?.textContent,
    ]),
  ).toEqual(['BUTTON', 'SECTION', 'Caller styling']);
  expect(
    await target.evaluate(
      (el) =>
        el.className.split(/\s+/).filter((name) => name.includes('-css-'))
          .length,
    ),
  ).toBe(2);
  await target.click();
  await expect(page.getByTestId('owner-events')).toHaveText('1 / true');
  await expect(target).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Focus component ref' }).click();
  await expect(target).toBeFocused();
  await target.press('Enter');
  await expect(page.getByTestId('owner-events')).toHaveText('2 / false');
});

test('parent shorthand and longhand contributions preserve native declaration semantics', async ({
  page,
}) => {
  await page.goto('/');
  const left = page.getByTestId('owner-left');
  await expect(left).toHaveCSS('padding-left', '20px');
  for (const side of ['top', 'right', 'bottom'])
    await expect(left).toHaveCSS(`padding-${side}`, '8px');
  for (const side of ['top', 'right', 'bottom', 'left'])
    await expect(page.getByTestId('owner-padding')).toHaveCSS(
      `padding-${side}`,
      '12px',
    );
});

test('caller base preserves internal theme/responsive/nested interactions and matching theme overrides stay local', async ({
  page,
}) => {
  await page.setViewportSize({ width: 500, height: 800 });
  await page.goto('/');
  const target = page.getByTestId('owner-conditionals');
  await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(target).toHaveCSS('color', 'rgb(0, 128, 0)');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page.getByRole('button', { name: 'Toggle caller dark' }).click();
  await expect(target).toHaveCSS('color', 'rgb(128, 0, 128)');
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 165, 0)');
  await page.getByRole('button', { name: 'Toggle caller dark' }).click();
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
});

test('class order, shared registration and null withdrawal cannot promote an entire caller bundle', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('owner-button');
  await target.evaluate((el) => {
    el.className = el.className.split(/\s+/).reverse().join(' ');
  });
  await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
  await page
    .getByRole('button', { name: 'Toggle unrelated styled component' })
    .click();
  await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.getByRole('button', { name: 'Withdraw caller with null' }).click();
  await expect(target).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(target).toHaveCSS('background-color', 'rgb(0, 0, 0)');
});
