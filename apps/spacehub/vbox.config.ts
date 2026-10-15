import { defineConfig } from '@veebox/core';

export default defineConfig({
  cssResets: true,
  aliases: {
    values: {
      glass: 'backdropFilter',
      cordelia: 'color',
    },
  },
  theme: {
    color: {
      canvas: {
        default: '#f5f8ff',
        dark: '#050711',
      },
      surface: {
        default: '#ffffff',
        dark: '#0c1223',
      },
      surfaceMuted: {
        default: '#e9eefb',
        dark: '#121a31',
      },
      ink: {
        default: '#0e1528',
        dark: '#f4f7ff',
      },
      brand: {
        default: '#4f7cff',
        dark: '#84a5ff',
      },
      accent: {
        default: '#02b5ff',
        dark: '#67deff',
      },
      success: {
        default: '#0f9d6b',
        dark: '#3ad7a5',
      },
      warning: {
        default: '#b87000',
        dark: '#ffc766',
      },
      danger: {
        default: '#c64356',
        dark: '#ff8fa1',
      },
      ring: {
        default: '#7da0ff',
        dark: '#9db5ff',
      },
    },
    borderRadius: {
      sm: '0.5rem',
      md: '0.875rem',
      lg: '1.2rem',
      xl: '1.75rem',
      pill: '999px',
    },
    spacing: {
      18: '4.5rem',
      22: '5.5rem',
      30: '7.5rem',
    },
    boxShadow: {
      card: '0 22px 50px rgba(4, 12, 36, 0.18)',
      focus:
        '0 0 0 3px color-mix(in oklab, var(--color-ring) 68%, transparent)',
    },
    zIndex: {
      header: '40',
      modal: '70',
    },
    fontSize: {
      hero: 'clamp(2rem, 5vw, 4rem)',
      h2: 'clamp(1.4rem, 2.8vw, 2.2rem)',
    },
  },
});
