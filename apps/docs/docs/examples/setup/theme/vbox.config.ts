import { defineConfig } from '@veebox/core';
export default defineConfig({
  cssResets: true,
  aliases: { values: { brandColor: 'color', pad2: 'padding' } },
  theme: { color: { brand: { default: '#123456', dark: '#abcdef' } } },
  breakpoints: { md: '50em' },
});
