import { defineConfig } from '@playwright/test';
import { driverPorts } from './drivers.mjs';
const browsers = ['chromium', 'firefox', 'webkit'] as const;
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  timeout: 20_000,
  expect: { timeout: 5_000 },
  retries: 0,
  use: { trace: 'retain-on-failure', viewport: { width: 1280, height: 800 } },
  projects: Object.entries(driverPorts).flatMap(([driver, port]) =>
    browsers.map((browserName) => ({
      name: `${driver}-${browserName}`,
      use: {
        browserName,
        baseURL: `http://127.0.0.1:${port}`,
      },
    })),
  ),
  webServer: Object.entries(driverPorts).map(([driver, port]) => ({
    command: `node serve.mjs ${driver}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 30_000,
  })),
});
