import { defineConfig } from '@playwright/test';
const development = process.env.NUXT_DEVELOPMENT === 'true';
export default defineConfig({
  testDir: './tests/nuxt',
  fullyParallel: true,
  workers: 2,
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4723',
    trace: 'retain-on-failure',
    viewport: { width: 900, height: 800 },
  },
  projects: ['chromium', 'firefox', 'webkit'].map((browserName) => ({
    name: `nuxt-${browserName}`,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
  webServer: {
    command: development
      ? 'pnpm --filter vboxssr dev --host 127.0.0.1 --port 4723'
      : 'node ../vboxssr/.output/server/index.mjs',
    env: { NITRO_HOST: '127.0.0.1', NITRO_PORT: '4723' },
    url: 'http://127.0.0.1:4723',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
