import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ guardRuntime: void }>({
  guardRuntime: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (/hydration/i.test(message.text())) errors.push(message.text());
      });
      await page.route('**/*', (route) => {
        const url = new URL(route.request().url());
        return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
      });
      await use();
      expect(errors, 'runtime and hydration errors').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
