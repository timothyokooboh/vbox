import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { vboxVitePlugin } from '@veebox/unplugin/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  plugins: [
    vboxVitePlugin(),
    vue(),
    tsconfigPaths({
      projects: [path.resolve(__dirname, 'tsconfig.json')],
    }),
  ],
  test: {
    environment: 'jsdom',
  },
});
