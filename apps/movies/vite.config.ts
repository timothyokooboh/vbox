import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vboxNativePlugin } from '@veebox/unplugin/vite';
import vboxConfig from './vbox.config';

export default defineConfig({
  plugins: [
    vboxNativePlugin({
      aliases: Object.keys(vboxConfig.aliases?.values ?? {}),
    }),
    vue(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
