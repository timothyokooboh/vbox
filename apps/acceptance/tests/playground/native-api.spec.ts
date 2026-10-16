import { test, expect } from '../browser/fixtures';

test('semantic translate and image dimensions remain distinct from styling', async ({
  page,
}) => {
  await page.goto('/');
  const button = page.getByTestId('playground-translate');
  await expect(button).toHaveAttribute('translate', 'no');
  await expect(button).toHaveAttribute('type', 'button');
  await expect(button).toHaveCSS('translate', '8px');
  await button.click();
  await expect(page.getByTestId('playground-clicks')).toHaveText('1');
  const image = page.getByTestId('playground-dimensions');
  await expect(image).toHaveAttribute('width', '160');
  await expect(image).toHaveAttribute('height', '80');
  await expect(image).toHaveCSS('width', '240px');
  await expect(image).toHaveCSS('height', '120px');
});

test('the existing product quantity interaction and token styles survive migration', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Urban Runner', exact: true }),
  ).toHaveCSS('font-size', '30px');
  const add = page.getByRole('button', { name: 'add', exact: true });
  const remove = page.getByRole('button', { name: 'remove', exact: true });
  await expect(remove).toBeDisabled();
  for (let count = 0; count < 4; count++) await add.click();
  await expect(add).toBeDisabled();
  await expect(remove).toBeEnabled();
  await remove.click();
  await expect(add).toBeEnabled();
});

test('grouped sources compose with direct bindings and withdrawal restores the remaining declaration', async ({
  page,
}) => {
  await page.goto('/');
  const sample = page.getByTestId('playground-composition');
  await expect(sample).toHaveCSS('color', 'rgb(128, 0, 128)');
  await expect(sample).toHaveCSS('padding-top', '12px');
  await expect(sample).toHaveCSS('padding-left', '24px');
  await page
    .getByRole('button', { name: 'Withdraw direct styles', exact: true })
    .click();
  await expect(sample).toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(sample).toHaveCSS('padding-left', '12px');
  await page
    .getByRole('button', { name: 'Withdraw later source', exact: true })
    .click();
  await expect(sample).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page
    .getByRole('button', { name: 'Restore composition', exact: true })
    .click();
  await expect(sample).toHaveCSS('color', 'rgb(128, 0, 128)');
  await expect(sample).toHaveCSS('padding-left', '24px');
  await expect(page.getByTestId('playground-shorthand')).toHaveCSS(
    'padding-left',
    '8px',
  );
});

test('theme-first hover and compatibility spellings work on ordinary buttons', async ({
  page,
}) => {
  await page.goto('/');
  const sample = page.getByTestId('playground-conditions');
  await sample.hover();
  await expect(sample).toHaveCSS('color', 'rgb(0, 128, 0)');
  await page
    .getByRole('button', { name: 'Toggle example theme', exact: true })
    .click();
  await sample.hover();
  await expect(sample).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page.setViewportSize({ width: 600, height: 800 });
  await sample.hover();
  await expect(sample).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page
    .getByRole('button', { name: 'Toggle example theme', exact: true })
    .click();
  await sample.hover();
  await expect(sample).toHaveCSS('color', 'rgb(255, 0, 0)');
  for (const name of ['clean', 'compatibility', 'legacy']) {
    await expect(page.getByTestId(`playground-${name}`)).toBeDisabled();
    await expect(page.getByTestId(`playground-${name}`)).toHaveCSS(
      'opacity',
      '0.5',
    );
    await expect(page.getByTestId(`playground-${name}`)).toHaveCSS(
      'width',
      '140px',
    );
  }
  await page.setViewportSize({ width: 1700, height: 800 });
  for (const name of ['clean', 'compatibility', 'legacy']) {
    await expect(page.getByTestId(`playground-${name}`)).toHaveCSS(
      'width',
      '180px',
    );
  }
});

test('PVA defaults and parent overrides reach only the explicitly forwarded style target', async ({
  page,
}) => {
  await page.goto('/');
  const single = page.getByTestId('playground-single');
  const fragment = page.getByTestId('playground-fragment');
  for (const target of [single, fragment]) {
    await expect(target).toHaveAttribute('type', 'button');
    await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
    await expect(target).toHaveCSS('background-color', 'rgb(18, 52, 86)');
    await target.hover();
    await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
    await target.click();
  }
  await expect(page.getByTestId('playground-target-clicks')).toHaveText('2');
  await expect(page.getByTestId('playground-fragment-note')).toHaveCSS(
    'color',
    'rgb(80, 80, 80)',
  );
  await expect(fragment).toHaveAttribute('aria-describedby', 'fragment-note');
  await page
    .getByRole('button', { name: 'Withdraw parent color', exact: true })
    .click();
  await expect(single).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(fragment).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page
    .getByRole('button', { name: 'Use outline variant', exact: true })
    .click();
  await expect(single).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(single).toHaveCSS('color', 'rgb(0, 0, 0)');
});
