import { test, expect } from '../browser/fixtures';

test('application demos explain both bundlers and link to source without inventing deployments', async ({
  page,
}) => {
  await page.goto('/demos/applications');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: /^Application showcases/, level: 1 }),
  ).toBeVisible();
  await expect(main).toContainText('pnpm --filter @vbox/movies dev');
  await expect(main).toContainText('pnpm --filter @vbox/atelier dev');
  await expect(main).toContainText('Vite');
  await expect(main).toContainText('webpack');
  await expect(
    main.getByRole('link', { name: 'Movies source', exact: true }),
  ).toHaveAttribute(
    'href',
    'https://github.com/timothyokooboh/vbox/tree/main/apps/movies',
  );
  await expect(
    main.getByRole('link', { name: 'Atelier source', exact: true }),
  ).toHaveAttribute(
    'href',
    'https://github.com/timothyokooboh/vbox/tree/main/apps/atelier',
  );
  await expect(main).toContainText('No hosted deployment is promised');
  await expect(main).not.toContainText('apps/spacehub');
});
