import { defineConfig } from '@veebox/core';
export default defineConfig({
  enableDefaultTheme: false,
  cssResets: true,
  breakpoints: { md: '50em', _2xl: '100rem' },
  classNamePrefix: 'acceptance',
  aliases: {
    values: { brandColor: 'color', pad2: 'padding', measure: 'width' },
  },
  theme: {
    color: {
      brand: { default: '#123456', dark: '#abcdef' },
      reference: '$color.brand',
    },
    spacing: { large: '24px', larger: '$spacing.large' },
    fontSize: { xl: '1.25rem', lg: '1.125rem' },
  },
});
