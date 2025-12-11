import { defineConfig } from '@veebox/core';

export default defineConfig({
  theme: {
    zIndex: {
      base: '0',
      dropdown: '1000',
      modal: '2000',
    },
    color: {
      'red-100': '#370617',
      'red-200': {
        default: '#dc2f02',
        dark: '#efefef',
      },
      /*
      'red-300': {
        default: '#dc2f02',
        dark: '#ff5733',
      },
      danger: '$color.red-300',*/
    },
  },
});
