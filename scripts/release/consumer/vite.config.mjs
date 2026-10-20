import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vboxVitePlugin } from '@veebox/unplugin/vite';
export default defineConfig({
  plugins: [vboxVitePlugin(), vue()],
  build: { outDir: 'dist/vite' },
});
