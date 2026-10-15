import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { vboxVitePlugin } from '@veebox/unplugin/vite';
import vboxConfig from './vbox.config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vboxVitePlugin({
      aliases: Object.keys(vboxConfig.aliases?.values ?? {}),
    }),
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
