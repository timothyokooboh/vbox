import { defineConfig, type VBoxStyleInput } from '@veebox/core';
import { VBoxPlugin, useVBoxStyleBinding } from '@veebox/vue';
import { vboxVitePlugin, vboxWebpackPlugin } from '@veebox/unplugin';
import { pva } from '@veebox/property-variance-authority';
export const config = defineConfig({ theme: { color: { brand: 'red' } } });
export const styles: VBoxStyleInput = {
  color: 'cl-brand',
  hover: { color: 'red' },
};
export const entries = [
  VBoxPlugin,
  useVBoxStyleBinding,
  vboxVitePlugin(),
  vboxWebpackPlugin(),
  pva({ variants: {} }),
];
