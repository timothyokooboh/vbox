import { defineConfig } from '@playwright/test';
const production = process.env.ATELIER_PRODUCTION === 'true';
export default defineConfig({
  testDir: './tests/atelier',
  workers: 2,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4727',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  projects: ['chromium', 'firefox', 'webkit'].map((browserName) => ({
    name: `atelier-${browserName}`,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
  webServer: {
    command: `pnpm --filter @vbox/atelier ${production ? 'preview' : 'dev'} --port 4727`,
    url: 'http://127.0.0.1:4727',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
