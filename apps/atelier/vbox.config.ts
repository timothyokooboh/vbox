import { defineConfig } from '@veebox/core';
export default defineConfig({
  classNamePrefix: 'atelier',
  cssResets: true,
  aliases: { values: { displayFace: 'fontFamily' } },
  theme: {
    color: {
      paper: { default: '#f4f1e9', dark: '#131c18' },
      surface: { default: '#e9e6dc', dark: '#202c25' },
      ink: { default: '#23382d', dark: '#edece1' },
      muted: { default: '#576459', dark: '#bcc7bc' },
      brand: { default: '#284e39', dark: '#c4d9af' },
      onBrand: { default: '#fffdf5', dark: '#1c3023' },
      line: { default: '#c5c9bb', dark: '#49594a' },
      clay: { default: '#9a4026', dark: '#f1ad8f' },
      ring: { default: '#8a351e', dark: '#f2c7a9' },
    },
    borderRadius: { frame: '0.25rem', pill: '999px' },
  },
});
