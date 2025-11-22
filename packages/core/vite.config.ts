import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    dts({
      outDir: "dist/types",
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "VBoxCore",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [],
    },
  },
});
