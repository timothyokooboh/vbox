import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'vite';
for (const mode of ['development', 'production']) {
  const result = await build({
    configFile: false,
    define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
    build: {
      write: false,
      minify: false,
      lib: {
        entry: 'environment.ts',
        formats: ['iife'],
        name: 'VBoxEnvironmentProbe',
      },
    },
  });
  const context = vm.createContext({ console });
  const output = Array.isArray(result) ? result[0].output : result.output;
  vm.runInContext(output.find((item) => item.type === 'chunk').code, context);
  assert.equal(
    context.VBoxEnvironmentProbe.__DEV__,
    mode === 'development',
    `browser ${mode} diagnostics flag`,
  );
}
