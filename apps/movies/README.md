# VBox Movies

A Vue 3 + TypeScript movie demo using Vite, Pinia, TanStack Vue Query, Radix
Vue, GSAP and workspace versions of core, Vue, unplugin, Volar and PVA. Styling
uses explicit `vb-*` bindings and `:vb`; ordinary props/listeners and `v-bind`
stay semantic. AppButton separates its element props from its PVA style sources.

## Run locally

From the repository root:

```sh
pnpm install
pnpm --filter '@veebox/*' build
pnpm --filter @vbox/movies dev
```

Without a TMDB key, the app uses fallback data. To use live data, configure
`VITE_TMDB_API_KEY` in the app's ignored `.env` using `.env.example`. Vite
embeds `VITE_*` values in client bundles: they are not server secrets. Never
commit real credentials or copy them into tests, issue comments, screenshots or
PR bodies.

The shared `vbox.config.ts` owns light/dark color tokens, custom aliases and CSS
resets. Theme switching, the existing 1500 ms search debounce, dialogs,
trailers, responsive layout and PVA variants remain intact during the API
migration. Visual and motion refinements are tracked separately.

## Verify

```sh
pnpm --filter @vbox/movies test
pnpm --filter @vbox/movies type-check
pnpm --filter @vbox/movies build
pnpm --filter @vbox/acceptance test:movies
```

The last command exercises the actual dev server and production build in
Chromium, Firefox and WebKit. Tests intercept TMDB at the HTTP boundary using a
non-secret placeholder key; they do not call the live API. They cover debounce
reset/timing, search result navigation and closure, focus return, layering,
trailers/empty states, detail loading/errors, theme changes and mobile controls.
Component tests cover PVA/caller withdrawal and semantic props/events.

Trailer tests verify the embed URL, accessible title and teardown, not
successful third-party video playback. Semantic markup and Radix primitives help
accessibility but do not constitute a complete WCAG audit or certification. No
test command publishes or deploys the app.
