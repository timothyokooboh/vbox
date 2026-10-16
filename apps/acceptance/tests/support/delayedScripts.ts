import type { Page, Route } from '@playwright/test';

/** Keep initial HTML observable, then explicitly allow hydration in the test. */
export async function withDelayedScripts(
  page: Page,
  pattern: string,
  exercise: (release: () => void) => Promise<void>,
) {
  let release!: () => void;
  const ready = new Promise<void>((resolve) => { release = resolve; });
  const handler = async (route: Route) => {
    await ready;
    await route.continue();
  };
  await page.route(pattern, handler);
  try { await exercise(release); }
  finally {
    release();
    if (!page.isClosed()) await page.unroute(pattern, handler);
  }
}
