import { defineConfig } from '@playwright/test';
const production = process.env.PLAYGROUND_PRODUCTION === 'true';
export default defineConfig({
  testDir: './tests/playground',
  fullyParallel: true,
  workers: 2,
  timeout: 20_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4724',
    trace: 'retain-on-failure',
    viewport: { width: 1000, height: 800 },
  },
  projects: ['chromium', 'firefox', 'webkit'].map((browserName) => ({
    name: `playground-${browserName}`,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
  webServer: {
    command: `pnpm --filter @vbox/playground ${production ? 'preview' : 'dev'} --host 127.0.0.1 --port 4724 --strictPort`,
    url: 'http://127.0.0.1:4724',
    timeout: 30_000,
    reuseExistingServer: false,
  },
});
