import { defineConfig } from '@playwright/test';
const browsers = ['chromium', 'firefox', 'webkit'] as const;
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  timeout: 20_000,
  expect: { timeout: 5_000 },
  retries: 0,
  use: { trace: 'retain-on-failure', viewport: { width: 1280, height: 800 } },
  projects: ['vite', 'webpack'].flatMap((driver) =>
    browsers.map((browserName) => ({
      name: `${driver}-${browserName}`,
      use: {
        browserName,
        baseURL: `http://127.0.0.1:${driver === 'vite' ? 4721 : 4722}`,
      },
    })),
  ),
  webServer: ['vite', 'webpack'].map((driver) => ({
    command: `node serve.mjs ${driver}`,
    url: `http://127.0.0.1:${driver === 'vite' ? 4721 : 4722}`,
    reuseExistingServer: false,
    timeout: 30_000,
  })),
});
