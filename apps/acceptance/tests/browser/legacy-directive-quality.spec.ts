import { test, expect } from './fixtures';

test('nested directive hover values remain independent across updates', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const changing = page.getByTestId('directive-hover-changing');
  const stable = page.getByTestId('directive-hover-stable');
  await changing.hover();
  await expect(changing).toHaveCSS('color', 'rgb(255, 0, 0)');
  await stable.hover();
  await expect(stable).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page
    .getByRole('button', { name: 'Update directive hover', exact: true })
    .click();
  await changing.hover();
  await expect(changing).toHaveCSS('color', 'rgb(0, 128, 0)');
  await stable.hover();
  await expect(stable).toHaveCSS('color', 'rgb(0, 0, 255)');
});

test('directive identity retains shorthand and longhand declaration order', async ({
  page,
}) => {
  await page.goto('/?ssr');
  await expect(page.getByTestId('directive-longhand-last')).toHaveCSS(
    'padding-left',
    '16px',
  );
  await expect(page.getByTestId('directive-shorthand-last')).toHaveCSS(
    'padding-left',
    '8px',
  );
});

test('shared directive ownership survives caller withdrawal, change and reapplication', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const target = page.getByTestId('directive-shared-action');
  const assertColor = async (color: string) => {
    await expect(target).toHaveCSS('color', color);
    await expect(target).toHaveClass(/\bdirective-authored-child\b/);
    await expect(target).toHaveClass(/\bdirective-authored-caller\b/);
  };
  await assertColor('rgb(255, 0, 0)');
  await page
    .getByRole('button', { name: 'Withdraw directive caller', exact: true })
    .click();
  await assertColor('rgb(255, 0, 0)');
  await page
    .getByRole('button', {
      name: 'Reapply shared directive caller',
      exact: true,
    })
    .click();
  await assertColor('rgb(255, 0, 0)');
  await page
    .getByRole('button', { name: 'Change directive caller', exact: true })
    .click();
  await assertColor('rgb(0, 0, 255)');
  await page
    .getByRole('button', { name: 'Withdraw directive caller', exact: true })
    .click();
  await assertColor('rgb(255, 0, 0)');
  await page
    .getByRole('button', {
      name: 'Reapply shared directive caller',
      exact: true,
    })
    .click();
  await assertColor('rgb(255, 0, 0)');
});

test('same-prefix Vue apps retain their own alias and breakpoint meanings', async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto('/?ssr');
  const width = page.getByTestId('directive-app-width');
  const height = page.getByTestId('directive-app-height');
  const breakpoint = page.getByTestId('directive-app-breakpoint');
  await expect(width).toHaveCSS('width', '64px');
  await expect(width).toHaveCSS('height', '40px');
  await expect(height).toHaveCSS('width', '40px');
  await expect(height).toHaveCSS('height', '64px');
  await expect(width).toHaveCSS('color', 'rgb(128, 0, 128)');
  await expect(height).toHaveCSS('color', 'rgb(128, 0, 128)');
  await expect(breakpoint).toHaveCSS('width', '64px');
  await expect(breakpoint).toHaveCSS('color', 'rgb(0, 0, 0)');
  await page.setViewportSize({ width: 1300, height: 900 });
  await expect(breakpoint).toHaveCSS('color', 'rgb(128, 0, 128)');
  await page.setViewportSize({ width: 300, height: 900 });
  for (const target of [width, height, breakpoint]) {
    await expect(target).toHaveCSS('color', 'rgb(0, 0, 0)');
  }
});
