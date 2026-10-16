import { defineConfig } from '@veebox/core';
export default defineConfig({
  enableDefaultTheme: false,
  cssResets: true,
  aliases: { values: { brandColor: 'color' } },
  theme: {
    color: {
      brand: { default: '#123456', dark: '#abcdef' },
      canvas: { default: '#ffffff', dark: '#101820' },
    },
  },
});
