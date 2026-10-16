import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vboxVitePlugin } from '@veebox/unplugin/vite';
export default defineConfig({
  plugins: [
    vboxVitePlugin({
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      configPath: './theme/vbox.config.ts',
    }),
    vue(),
  ],
});
