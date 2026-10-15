import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vboxVitePlugin } from '@veebox/unplugin/vite';
export default defineConfig({
  plugins: [vboxVitePlugin(), vue()],
  define: { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true },
  build: { outDir: 'dist/vite' },
});
