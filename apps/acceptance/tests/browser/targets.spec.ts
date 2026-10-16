import { test, expect } from './fixtures';

test('fragment and inheritAttrs-false components style only their explicitly forwarded target', async ({
  page,
}) => {
  await page.goto('/?ssr');
  await expect(page.getByTestId('fragment-target')).toHaveCSS(
    'color',
    'rgb(255, 255, 0)',
  );
  await expect(page.getByTestId('fragment-sibling')).toHaveCSS(
    'color',
    'rgb(0, 128, 0)',
  );
  await expect(page.getByTestId('controlled-target')).toHaveCSS(
    'color',
    'rgb(0, 0, 255)',
  );
  await expect(page.getByTestId('unforwarded-first')).toHaveCSS(
    'color',
    'rgb(0, 128, 0)',
  );
  await expect(page.getByTestId('unforwarded-second')).toHaveCSS(
    'color',
    'rgb(0, 128, 0)',
  );
  await expect(page.getByTestId('fragment-target')).toHaveClass(
    /target-authored/,
  );
  expect(
    await page
      .getByTestId('fragment-target')
      .evaluate((el) => el.parentElement?.tagName),
  ).toBe('SECTION');
  await page.getByTestId('fragment-target').click();
  await expect(page.getByTestId('forwarded-events')).toHaveText('1');
});

test('compiled caller conditions override matching published VBox conditions without erasing defaults', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('legacy-composition');
  await expect(target).toHaveCSS('color', 'rgb(255, 255, 0)');
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(target).toHaveCSS('background-color', 'rgb(128, 0, 128)');
  await page
    .getByRole('button', { name: 'Withdraw legacy caller hover', exact: true })
    .click();
  await target.hover();
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page
    .getByRole('button', { name: 'Withdraw legacy caller base', exact: true })
    .click();
  await expect(target).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(target).toHaveClass(/legacy-authored/);
});

test('asChild tracks slot and target updates, refs, merged classes/styles and one event per listener', async ({
  page,
}) => {
  await page.goto('/');
  const child = page.getByTestId('adopted-child');
  await expect(child).toHaveJSProperty('tagName', 'BUTTON');
  await expect(child).toHaveClass(/adopted-parent/);
  await expect(child).toHaveClass(/adopted-child/);
  await expect(child).toHaveCSS('font-style', 'italic');
  await expect(child).toHaveCSS('color', 'rgb(128, 0, 128)');
  await expect(child).toHaveCSS('padding-left', '4px');
  await child.click();
  await expect(page.getByTestId('adopted-events')).toHaveText('1 / 1');
  await page
    .getByRole('button', { name: 'Update adopted slot', exact: true })
    .click();
  await expect(child).toHaveText('Updated child');
  await page
    .getByRole('button', { name: 'Change adopted tag', exact: true })
    .click();
  await expect(child).toHaveJSProperty('tagName', 'A');
  await page
    .getByRole('button', { name: 'Focus adopted ref', exact: true })
    .click();
  await expect(child).toBeFocused();
  for (let cycle = 0; cycle < 2; cycle++) {
    await page
      .getByRole('button', { name: 'Toggle adoption', exact: true })
      .click();
    await expect(page.locator('.adopted-parent')).toHaveJSProperty(
      'tagName',
      'SECTION',
    );
    await page
      .getByRole('button', { name: 'Toggle adoption', exact: true })
      .click();
    await expect(child).toHaveClass(/adopted-parent/);
    await expect(child).toHaveCSS('padding-left', '4px');
  }
});

test('asChild can be enabled after mount and never silently chooses a root from multiple children', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.late-parent')).toHaveJSProperty(
    'tagName',
    'SECTION',
  );
  await page
    .getByRole('button', { name: 'Enable late adoption', exact: true })
    .click();
  await expect(page.getByTestId('late-child')).toHaveClass(/late-parent/);
  await expect(page.getByTestId('constrained-child')).toHaveCSS(
    'color',
    'rgb(255, 255, 0)',
  );
  await page
    .getByRole('button', {
      name: 'Toggle multiple adopted children',
      exact: true,
    })
    .click();
  await expect(page.getByTestId('constrained-child')).toHaveCount(0);
  await expect(page.getByTestId('extra-child')).toHaveCount(0);
  await page
    .getByRole('button', {
      name: 'Toggle multiple adopted children',
      exact: true,
    })
    .click();
  await expect(page.getByTestId('constrained-child')).toHaveCSS(
    'color',
    'rgb(255, 255, 0)',
  );
});

test('real RouterLink and Radix asChild preserve navigation and keyboard state through normal forwarding', async ({
  page,
}) => {
  await page.goto('/?ssr');
  const link = page.getByRole('link', {
    name: 'Router destination',
    exact: true,
  });
  await expect(link).toHaveAttribute('href', '/destination');
  await expect(link).toHaveCSS('color', 'rgb(128, 0, 128)');
  await link.click();
  await expect(page.getByTestId('integration-route')).toHaveText(
    '/destination',
  );
  const frameworkLink = page.getByRole('link', {
    name: 'Framework link',
    exact: true,
  });
  await expect(frameworkLink).toHaveCSS('color', 'rgb(0, 128, 0)');
  await frameworkLink.click();
  await expect(page.getByTestId('integration-route')).toHaveText('/framework');
  const toggle = page.getByRole('button', {
    name: 'Accessible toggle',
    exact: true,
  });
  await expect(toggle).toHaveCSS('color', 'rgb(255, 255, 0)');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.focus();
  await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toHaveAttribute('data-state', 'on');
  await expect(page.getByTestId('integration-toggle')).toHaveText('true');
  const adopted = page.getByRole('button', {
    name: 'Adopted primitive',
    exact: true,
  });
  await expect(adopted).toHaveCSS('color', 'rgb(0, 0, 255)');
  await adopted.click();
  await expect(adopted).toHaveAttribute('aria-pressed', 'true');
});
