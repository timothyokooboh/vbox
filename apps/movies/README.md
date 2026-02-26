# VBox Movies

Netflix-like movie demo app built with Vue 3 + VBox native syntax.

## Stack

- Vite + Vue 3 + TypeScript
- Pinia
- @tanstack/vue-query
- Radix Vue
- GSAP
- VBox (`@veebox/core`, `@veebox/vue`, `@veebox/unplugin`, `@veebox/volar`)

## Setup

1. Copy `.env.example` to `.env`
2. Add your TMDB API key as `VITE_TMDB_API_KEY`
3. Run `pnpm -C apps/movies dev`

If no key is provided, mock fallback data is used so the UI still renders.

## Accessibility

The app uses semantic HTML tags, accessible dialog/switch primitives from Radix Vue,
keyboard focus visibility, reduced motion support, and contrast-safe tokens.
