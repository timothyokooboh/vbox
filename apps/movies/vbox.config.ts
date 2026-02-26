import { defineConfig } from '@veebox/core';

export default defineConfig({
  classNamePrefix: 'vbm',
  cssResets: true,
  aliases: {
    values: {
      glass: 'backdropFilter',
      mTop: 'marginTop',
    },
  },
  breakpoints: {
    sm: '40rem',
    md: '52rem',
    lg: '70rem',
    xl: '88rem',
    _2xl: '100rem',
  },
  theme: {
    zIndex: {
      header: '2',
      modalOverlay: '3',
      modalContent: '4',
    },
    color: {
      brand: {
        default: '#d1131e',
        dark: '#e50914',
      },
      ink: {
        default: '#11131f',
        dark: '#f5f7ff',
      },
      canvas: {
        default: '#f6f8ff',
        dark: '#090b16',
      },
      'canvas-soft': {
        default: '#dfe7ff',
        dark: '#121526',
      },
      accent: {
        default: '#0067a5',
        dark: '#00d1ff',
      },
      ring: {
        default: '#1c4ce0',
        dark: '#74b9ff',
      },
    },
    spacing: {
      18: '4.5rem',
    },
    borderRadius: {
      card: '1rem',
      pill: '999px',
    },
    boxShadow: {
      card: '0 20px 50px rgba(0,0,0,0.25)',
      glow: '0 0 0 1px rgba(255,255,255,0.08), 0 15px 60px rgba(0,0,0,0.4)',
    },
  },
});
