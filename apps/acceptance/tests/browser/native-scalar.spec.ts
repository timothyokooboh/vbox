import { test, expect } from './fixtures';

test('explicit static and bound styles update without leaking style attributes', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('scalar');
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await expect(target).toHaveCSS('width', '35px');
  await expect(target).not.toHaveAttribute('vb-color');
  await expect(target).not.toHaveAttribute('vb-width');
  await page.getByRole('button', { name: 'Resize native' }).click();
  await expect(target).toHaveCSS('width', '80px');
});

test('HTML and SVG semantic dimensions and translate remain independent of CSS', async ({
  page,
}) => {
  await page.goto('/');
  const input = page.getByTestId('semantic-input');
  await expect(input).toHaveAttribute('translate', 'no');
  await expect(input).toHaveAttribute('width', '12');
  await expect(input).toHaveAttribute('height', '7');
  await expect(input).toHaveCSS('translate', '8px');
  await expect(input).toHaveCSS('width', '35px');
  await expect(input).toHaveCSS('height', '20px');
  await page.getByRole('button', { name: 'Focus native' }).click();
  await expect(input).toBeFocused();
  const svg = page.getByTestId('semantic-svg');
  await expect(svg).toHaveAttribute('width', '200');
  await expect(svg).toHaveAttribute('height', '30');
  await expect(svg).toHaveCSS('width', '90px');
  await expect(svg).toHaveCSS('height', '25px');
  await expect(page.getByTestId('svg-fill')).toHaveAttribute('fill', 'blue');
  await expect(page.getByTestId('svg-fill')).toHaveCSS(
    'fill',
    'rgb(255, 0, 0)',
  );
});

test('spreads, dynamic names, and unrelated component props remain semantic', async ({
  page,
}) => {
  await page.goto('/');
  const spread = page.getByTestId('spread');
  await expect(spread).toHaveAttribute('title', 'Spread title');
  await expect(spread).toHaveAttribute('translate', 'no');
  await expect(spread).toHaveAttribute('vb-width', '999px');
  await expect(spread).toHaveAttribute('vb-height', '22px');
  await expect(spread).not.toHaveCSS('width', '999px');
  await expect(page.getByTestId('semantic-component')).toHaveText(
    'tomato / lg',
  );
});

test('namespace boundaries and both Vue spellings are explicit', async ({
  page,
}) => {
  await page.goto('/');
  const target = page.getByTestId('camel');
  await expect(target).toHaveCSS('color', 'rgb(128, 0, 128)');
  await expect(target).toHaveCSS('font-size', '18px');
  await expect(target).toHaveAttribute('vbcolor', 'semantic');
  await expect(target).not.toHaveAttribute('vb-future-css-property');
  await expect(target).not.toHaveAttribute('vb-font-size');
});

test('expressions keep their scope and execute once per rendering', async ({
  page,
}) => {
  await page.goto('/');
  const report = page.getByRole('button', { name: 'Expression calls' });
  await report.click();
  await expect(report).toHaveAttribute('data-calls', '1');
  await page.getByRole('button', { name: 'Resize native' }).click();
  await report.click();
  await expect(report).toHaveAttribute('data-calls', '2');
  await expect(page.getByTestId('scoped-1')).toHaveCSS('width', '21px');
  await expect(page.getByTestId('scoped-2')).toHaveCSS('width', '42px');
  await expect(page.getByTestId('scalar')).toHaveClass(/authored-class/);
  await expect(page.getByTestId('scalar')).toHaveCSS('border-top-width', '2px');
});

test('consumer local directive bindings cannot capture generated styling', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('directive-collision')).toHaveCSS(
    'color',
    'rgb(128, 0, 128)',
  );
  await expect(page.getByTestId('directive-collision')).not.toHaveAttribute(
    'data-local-directive',
  );
  await expect(page.getByTestId('local-directive')).toHaveAttribute(
    'data-local-directive',
    'used',
  );
});

test('scalar classes hydrate with authored classes and keep updating', async ({
  page,
}) => {
  await page.goto('/?ssr');
  await expect(page.locator('html')).toHaveAttribute('data-mounted', 'true');
  const target = page.getByTestId('scalar');
  await expect(target).toHaveClass(/authored-class/);
  await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.getByRole('button', { name: 'Resize native' }).click();
  await expect(target).toHaveCSS('width', '80px');
  await expect(target).toHaveClass(/authored-class/);
});

for (const route of ['/', '/?ssr']) {
  test(`normal setup state, hooks, Options API and events survive on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);
    const button = page.getByTestId('normal-setup');
    await expect(button).toHaveText('Options preserved');
    await expect(button).toHaveAttribute('data-mounted', 'true');
    await expect(button).toHaveCSS('color', 'rgb(255, 0, 0)');
    await button.click();
    await expect(button).toHaveCSS('color', 'rgb(0, 0, 255)');
  });
}
