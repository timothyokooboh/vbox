import { defineConfig } from '@playwright/test';
const production = process.env.MOVIES_PRODUCTION === 'true';
export default defineConfig({
  testDir: './tests/movies',
  workers: 2,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4726',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 900 },
  },
  projects: ['chromium', 'firefox', 'webkit'].map((browserName) => ({
    name: `movies-${browserName}`,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
  webServer: {
    command: `VITE_TMDB_API_KEY=acceptance-placeholder pnpm --filter @vbox/movies ${production ? 'preview' : 'dev'} --host 127.0.0.1 --port 4726 --strictPort`,
    url: 'http://127.0.0.1:4726',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
