import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/nuxt',
  fullyParallel: true,
  workers: 2,
  timeout: 30_000,
  retries: 0,
  use: { baseURL: 'http://127.0.0.1:4723', trace: 'retain-on-failure', viewport: { width: 900, height: 800 } },
  projects: ['chromium', 'firefox', 'webkit'].map((browserName) => ({
    name: `nuxt-${browserName}`,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
  webServer: {
    command: 'node ../vboxssr/.output/server/index.mjs',
    env: { NITRO_HOST: '127.0.0.1', NITRO_PORT: '4723' },
    url: 'http://127.0.0.1:4723',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
