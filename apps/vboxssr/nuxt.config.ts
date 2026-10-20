import { fileURLToPath } from 'node:url';
import { vboxVitePlugin } from '@veebox/unplugin/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: {
    tsConfig: {
      vueCompilerOptions: {
        plugins: [
          {
            name: '@veebox/volar',
            configPath: fileURLToPath(
              new URL('./vbox.config.ts', import.meta.url),
            ),
          },
        ],
      },
    },
  },
  vite: {
    plugins: [vboxVitePlugin()],
  },
});
