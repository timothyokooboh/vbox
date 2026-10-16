import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/docs',
  workers: 2,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:4725', trace: 'retain-on-failure' },
  projects: ['chromium', 'firefox', 'webkit'].map((browserName) => ({
    name: `docs-${browserName}`,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
  webServer: {
    command: 'pnpm --filter docs preview --host 127.0.0.1 --port 4725',
    url: 'http://127.0.0.1:4725',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
