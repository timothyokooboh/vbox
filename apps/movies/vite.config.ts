import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vboxVitePlugin } from '@veebox/unplugin/vite';
import vboxConfig from './vbox.config';

export default defineConfig({
  plugins: [
    vboxVitePlugin({
      aliases: Object.keys(vboxConfig.aliases?.values ?? {}),
    }),
    vue(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
