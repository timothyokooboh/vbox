import { test, expect } from './fixtures';
import { startDevFixture } from '../support/dev-fixture';

test('config changes update rendered aliases and tokens without restarting the bundler', async ({
  page,
}, info) => {
  test.setTimeout(60_000);
  const driver = info.project.name.startsWith('vite') ? 'vite' : 'webpack';
  const fixture = await startDevFixture(driver);
  try {
    await page.goto(fixture.url);
    const target = page.getByText('Live config');
    await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(target).toHaveCSS('width', '32px');
    await fixture.update();
    await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
    await expect(target).toHaveCSS('height', '32px');
    await expect(target).not.toHaveCSS('width', '32px');
  } finally {
    await fixture.close();
  }
});

test('template-only style edits hot-update the browser without losing component state', async ({
  page,
}, info) => {
  test.setTimeout(60_000);
  const fixture = await startDevFixture(
    info.project.name.startsWith('vite') ? 'vite' : 'webpack',
  );
  try {
    await page.goto(fixture.url);
    await page.getByRole('button', { name: 'Count 0', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Count 1', exact: true }),
    ).toBeVisible();
    await fixture.updateSource();
    await expect(page.getByText('Live config', { exact: true })).toHaveCSS(
      'width',
      '64px',
    );
    await expect(
      page.getByRole('button', { name: 'Count 1', exact: true }),
    ).toBeVisible();
  } finally {
    await fixture.close();
  }
});
