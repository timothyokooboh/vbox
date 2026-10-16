import { test, expect } from './fixtures';

test('outermost matching callers withdraw independently through three style owners', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('nested-owner');
  const color = (value: string) => expect(target).toHaveCSS('color', value);
  const click = (name: string) =>
    page.getByRole('button', { name, exact: true }).click();
  for (let cycle = 0; cycle < 3; cycle++) {
    await color('rgb(255, 255, 0)');
    await target.hover();
    await color('rgb(0, 0, 255)');
    await click('Withdraw outer hover');
    await target.hover();
    await color('rgb(255, 165, 0)');
    await click('Withdraw nearer hover');
    await target.hover();
    await color('rgb(255, 0, 0)');
    await click('Withdraw outer base');
    await color('rgb(0, 128, 0)');
    await click('Withdraw nearer base');
    await color('rgb(255, 255, 255)');
    await expect(target).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(target).toHaveClass(/owned-surface/);
    await expect(target).toHaveClass(/nearer-caller/);
    await expect(target).toHaveClass(/outer-caller/);
    await click('Restore nested styles');
  }
});

test('root replacement and remounts retain each active owner without promoting shared styles', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const target = page.getByTestId('nested-owner');
  const shared = page.getByTestId('nested-shared');
  for (let cycle = 0; cycle < 3; cycle++) {
    await target.evaluate((el) => {
      el.className = el.className.split(/\s+/).reverse().join(' ');
    });
    await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
    const oldRoot = await target.elementHandle();
    await page
      .getByRole('button', { name: 'Replace nested root', exact: true })
      .click();
    await expect(target).toHaveJSProperty(
      'tagName',
      cycle % 2 ? 'BUTTON' : 'A',
    );
    expect(await oldRoot!.evaluate((el) => el.isConnected)).toBe(false);
    await expect(target).toHaveClass(/owned-surface/);
    await expect(target).toHaveClass(/nearer-caller/);
    await expect(target).toHaveClass(/outer-caller/);
    await target.hover();
    await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
    await page
      .getByRole('button', { name: 'Toggle nested instance', exact: true })
      .click();
    await expect(target).toHaveCount(0);
    await expect(shared).toHaveCSS('color', 'rgb(255, 255, 0)');
    await page
      .getByRole('button', { name: 'Toggle nested instance', exact: true })
      .click();
    await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
    await expect(shared).toHaveCSS('color', 'rgb(255, 255, 0)');
  }
});

test('frozen sources reused at different owner positions do not promote one another', async ({
  page,
}) => {
  await page.goto('/');
  const reused = page.getByTestId('nested-reused-internal');
  const shared = page.getByTestId('nested-shared');
  const snapshot = page.getByTestId('nested-frozen-source');
  for (let cycle = 0; cycle < 3; cycle++) {
    await expect(reused).toHaveCSS('color', 'rgb(0, 128, 0)');
    await expect(shared).toHaveCSS('color', 'rgb(255, 255, 0)');
    await reused.hover();
    await expect(reused).toHaveCSS('color', 'rgb(255, 165, 0)');
    await shared.hover();
    await expect(shared).toHaveCSS('color', 'rgb(0, 0, 255)');
    await page
      .getByRole('button', { name: 'Toggle reused instance', exact: true })
      .click();
    await expect(reused).toHaveCount(0);
    await expect(shared).toHaveCSS('color', 'rgb(255, 255, 0)');
    await page
      .getByRole('button', { name: 'Toggle reused instance', exact: true })
      .click();
    await expect(snapshot).toHaveText(
      '{"color":"yellow","hover":{"color":"blue"}}',
    );
  }
});

test('nested shorthand, zero and reset contributions withdraw without erasing matching selector defaults', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('nested-numeric');
  for (let cycle = 0; cycle < 3; cycle++) {
    await expect(target).toHaveCSS('opacity', '0');
    await expect(target).toHaveCSS('padding-left', '12px');
    await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
    await page
      .getByRole('button', { name: 'Reset nested declarations', exact: true })
      .click();
    await expect(target).toHaveCSS('opacity', '1');
    for (const side of ['left', 'right', 'top', 'bottom'])
      await expect(target).toHaveCSS(`padding-${side}`, '0px');
    await page
      .getByRole('button', {
        name: 'Withdraw nested declarations',
        exact: true,
      })
      .click();
    await expect(target).toHaveCSS('opacity', '0.4');
    await expect(target).toHaveCSS('padding-left', '20px');
    await expect(target).toHaveCSS('padding-right', '8px');
    await expect(target).toHaveCSS('color', 'rgb(0, 128, 0)');
    await page
      .getByRole('button', { name: 'Restore nested declarations', exact: true })
      .click();
  }
});

test('live withdrawal cannot erase cached v-once or v-memo styling and slots keep their authoring owner', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const live = page.getByTestId('cached-live');
  const once = page.getByTestId('cached-once');
  const memo = page.getByTestId('cached-memo');
  const slot = page.getByTestId('cached-slot');
  for (let cycle = 0; cycle < 3; cycle++) {
    await page
      .getByRole('button', {
        name: 'Withdraw live shared styling',
        exact: true,
      })
      .click();
    await expect(live).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(once).toHaveCSS('color', 'rgb(255, 255, 0)');
    await expect(memo).toHaveCSS('color', 'rgb(255, 255, 0)');
    await expect(slot).toHaveCSS('color', 'rgb(0, 128, 0)');
    await once.hover();
    await expect(once).toHaveCSS('color', 'rgb(0, 0, 255)');
    await page
      .getByRole('button', { name: 'Restore live shared styling', exact: true })
      .click();
    await expect(slot).toHaveCSS('color', 'rgb(255, 255, 0)');
    await expect(live).toHaveCSS('color', 'rgb(255, 255, 0)');
  }
  await page
    .getByRole('button', { name: 'Withdraw live shared styling', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Invalidate memo styling', exact: true })
    .click();
  await expect(memo).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(once).toHaveCSS('color', 'rgb(255, 255, 0)');
});
