import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "VBoxCore",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [], // Keep the build pure — no deps bundled
    },
  },
});
