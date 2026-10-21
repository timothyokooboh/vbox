import { test, expect } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=syntax');
});

test('loop and branch expressions retain scope and evaluate once per element render', async ({
  page,
}) => {
  await expect(page.getByTestId('evaluations')).toHaveText('2');
  await expect(
    page.getByRole('button', { name: 'Row Ada', exact: true }),
  ).toHaveCSS('color', 'rgb(255, 0, 0)');
  await expect(
    page.getByRole('button', { name: 'Row Lin', exact: true }),
  ).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page
    .getByRole('button', { name: 'Refresh styles', exact: true })
    .click();
  await expect(page.getByTestId('evaluations')).toHaveText('4');
  await page.getByRole('button', { name: 'Toggle rows', exact: true }).click();
  await expect(page.getByTestId('branch-fallback')).toHaveText('Rows hidden');
  await expect(
    page.getByRole('button', { name: 'Row Ada', exact: true }),
  ).toHaveCount(0);
});

test('Vue shorthand and dynamic arguments retain their native attribute meaning', async ({
  page,
}) => {
  const input = page.getByRole('textbox', {
    name: 'Native field',
    exact: true,
  });
  await expect(input).toHaveAttribute('id', 'native-field');
  await expect(input).toHaveAttribute('translate', 'no');
  await expect(input).toHaveCSS('color', 'rgb(0, 128, 0)');
});

test('native v-model updates retain their reactive value', async ({ page }) => {
  const input = page.getByRole('textbox', {
    name: 'Native field',
    exact: true,
  });
  await input.fill('Edited');
  await expect(page.getByTestId('model-value')).toHaveText('Edited');
});

test('template refs still target the native input', async ({ page }) => {
  const input = page.getByRole('textbox', {
    name: 'Native field',
    exact: true,
  });
  await page.getByRole('button', { name: 'Focus field', exact: true }).click();
  await expect(input).toBeFocused();
});

test('ordinary spread attributes and merged listeners retain Vue semantics', async ({
  page,
}) => {
  const spread = page.getByTestId('semantic-spread');
  await expect(spread).toHaveClass(/authored/);
  await expect(spread).toHaveAttribute('vb-color', 'ordinary-runtime-key');
  await expect(spread).toHaveCSS('width', '40px');
  await spread.click();
  await expect(page.getByTestId('listener-values')).toHaveText('1 / 1');
});

test('scoped slots retain their nested template lexical scope', async ({
  page,
}) => {
  await expect(page.getByTestId('scoped-color')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
});

test('quoted attributes and text entities retain authored values', async ({
  page,
}) => {
  await expect(page.getByTestId('quoted')).toHaveAttribute(
    'title',
    'A < B > C { D }',
  );
  await expect(page.getByTestId('quoted')).toHaveText('Hello & goodbye');
});

test('self-closing SVG elements receive their own style binding', async ({
  page,
}) => {
  await expect(page.getByTestId('svg-path')).toHaveCSS(
    'stroke',
    'rgb(255, 0, 0)',
  );
});

test('template comments never become rendered elements', async ({ page }) => {
  await expect(page.getByText('Comment only', { exact: true })).toHaveCount(0);
});

test('Options API components keep their data and methods when their export is wrapped', async ({
  page,
}) => {
  const target = page.getByRole('button', {
    name: 'Options API style',
    exact: true,
  });
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await target.click();
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
});
