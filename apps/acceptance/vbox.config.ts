import { defineConfig } from '@veebox/core';
export default defineConfig({
  enableDefaultTheme: false,
  aliases: { values: { brandColor: 'color' } },
  theme: {
    color: { brand: '#123456' },
    fontSize: { xl: '1.25rem', lg: '1.125rem' },
  },
});
