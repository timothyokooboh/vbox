import { defineConfig } from '@veebox/core';

export default defineConfig({
  classNamePrefix: 'vbm',
  cssResets: true,
  aliases: {
    values: {
      glass: 'backdropFilter',
      mTop: 'marginTop',
      bfilter: 'backdropFilter',
      bImage: 'backgroundImage',
      textTra: 'textTransform',
      textDeco: 'textDecoration',
      backFil: 'backdropFilter',
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
        default: '#191b21',
        dark: '#f8f5ef',
      },
      canvas: {
        default: '#f7f5f0',
        dark: '#0d1015',
      },
      'canvas-soft': {
        default: '#eae6de',
        dark: '#191e26',
      },
      accent: {
        default: '#80400c',
        dark: '#f3c67a',
      },
      muted: { default: '#52565e', dark: '#bbc0c9' },
      ring: {
        default: '#1c4ce0',
        dark: '#74b9ff',
      },
    },
    spacing: {
      18: '4.5rem',
    },
    borderRadius: {
      card: '0.75rem',
      panel: '1.5rem',
      pill: '999px',
    },
    boxShadow: {
      card: '0 20px 50px rgba(0,0,0,0.25)',
      glow: '0 0 0 1px rgba(255,255,255,0.08), 0 15px 60px rgba(0,0,0,0.4)',
    },
  },
});
