import { defineConfig } from '@veebox/core';

export default defineConfig({
  // cssResets: true,
  aliases: {
    values: {
      cl: 'color',
      mTop: 'marginTop',
      mBottom: 'marginBottom',
      onBorder: 'border',
    },
  },
  theme: {
    color: {
      brand: 'pink',
      danger: {
        default: 'rgb(120,0,0)',
        dark: 'rgb(220,0,0)',
      },
      primary: '#FAF506',
      'bg-product': {
        default: '#fff',
        dark: '#22210E',
      },
      'text-product': {
        default: '#1c1c0d',
        dark: '#fff',
      },
    },
    borderRadius: {
      temi: '10px',
      full: '9999px',
    },
    boxShadow: {
      md: '0px 10px 15px rgba(0,0,0,.5)',
    },
  },
});
