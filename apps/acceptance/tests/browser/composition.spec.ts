import { test, expect } from './fixtures';

test('source insertion, removal and order retain CSS shorthand and longhand semantics', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('sources');
  await expect(target).toHaveCSS('padding-left', '20px');
  await expect(target).toHaveCSS('padding-right', '8px');
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  await page
    .getByRole('button', { name: 'Reverse sources', exact: true })
    .click();
  for (const side of ['left', 'right', 'top', 'bottom'])
    await expect(target).toHaveCSS(`padding-${side}`, '8px');
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page
    .getByRole('button', { name: 'Withdraw source', exact: true })
    .click();
  await expect(target).toHaveCSS('padding-left', '8px');
  await page
    .getByRole('button', { name: 'Clear sources', exact: true })
    .click();
  await expect(target).toHaveCSS('padding-left', '0px');
  await page
    .getByRole('button', { name: 'Insert source', exact: true })
    .click();
  await expect(target).toHaveCSS('padding-left', '20px');
});

test('direct styling wins regardless of template position and withdrawal reveals grouped values', async ({
  page,
}) => {
  await page.goto('/?ssr');
  for (const id of ['sources-direct-first', 'sources-direct-last']) {
    await expect(page.getByTestId(id)).toHaveCSS('padding-left', '12px');
  }
  await page
    .getByRole('button', { name: 'Withdraw direct', exact: true })
    .click();
  for (const id of ['sources-direct-first', 'sources-direct-last']) {
    await expect(page.getByTestId(id)).toHaveCSS('padding-left', '20px');
    await expect(page.getByTestId(id)).toHaveCSS('padding-right', '8px');
  }
  await page
    .getByRole('button', { name: 'Replace direct', exact: true })
    .click();
  for (const id of ['sources-direct-first', 'sources-direct-last'])
    await expect(page.getByTestId(id)).toHaveCSS('padding-left', '24px');
});

test('zero and explicit resets survive while shared frozen sources remain independent', async ({
  page,
}) => {
  await page.goto('/');
  const before = await page.getByTestId('sources-snapshot').textContent();
  await page.getByRole('button', { name: 'Reset source', exact: true }).click();
  await expect(page.getByTestId('sources')).toHaveCSS('opacity', '0');
  await expect(page.getByTestId('sources')).toHaveCSS('padding-left', '0px');
  await expect(page.getByTestId('sources-independent')).toHaveCSS(
    'padding-left',
    '20px',
  );
  await expect(page.getByTestId('sources-independent')).toHaveCSS(
    'opacity',
    '0.6',
  );
  await expect(page.getByTestId('sources-snapshot')).toHaveText(before!);
});

test('aliases, equivalent contexts, invalid CSS fallback and PVA shallow merge retain their meaning', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('sources-fallback')).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
  await expect(page.getByTestId('sources-aliases')).toHaveCSS(
    'padding-inline-start',
    '16px',
  );
  await expect(page.getByTestId('sources-aliases')).toHaveCSS(
    'padding-inline-end',
    '4px',
  );
  await expect(page.getByTestId('sources-contexts')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
  await expect(page.getByTestId('sources-contexts')).toHaveCSS(
    'opacity',
    '0.4',
  );
  await page.getByTestId('sources-pva').hover();
  await expect(page.getByTestId('sources-pva')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
  await expect(page.getByTestId('sources-pva')).toHaveCSS('opacity', '1');
});

test('later base sources do not erase separate conditional contexts', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('sources-conditional')).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByTestId('sources-conditional')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
});
