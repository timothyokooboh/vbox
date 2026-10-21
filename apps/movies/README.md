# VBox Movies

A Vue 3 + TypeScript movie demo using Vite, Pinia, TanStack Vue Query, Radix Vue
and workspace versions of core, Vue, unplugin, Volar and PVA. Styling uses
explicit `vb-*` bindings and `:vb`; ordinary props/listeners and `v-bind` stay
semantic. AppButton separates its element props from its PVA style sources.

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
migration and showcase polish. Layout, colors, states and component styling use
VBox; the small global stylesheet handles the document font, browser
view-transition pseudo-elements and application-wide input/reduced-motion
policies.

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

## Showcase checks

The consumer matrix also covers both themes with axe-core (WCAG 2 A/AA, 2.1 AA
and 2.2 AA rules), keyboard skip/focus/dialog behavior, touch targets, reduced
motion, progressive view transitions and hover interruption. Axe results are
saved as test attachments, including incomplete checks for manual follow-up.
They are not a screen-reader or real-device audit.

Pointer navigation uses Vue Router's built-in `viewTransition` option. Keyboard
navigation and reduced-motion preferences bypass it. The transition uses the
single browser root snapshot, never movie IDs (a title may appear in several
rows). Cards animate only their transform for 180 ms on fine-pointer hover;
keyboard focus is immediate. Skeletons are static, decorative placeholders under
an accessible loading status. No infinite shimmer or per-frame Vue updates.

The self-hosted Manrope font is provided by `@fontsource-variable/manrope` under
OFL-1.1; its package includes the license. There is no third-party font request.

See [the recorded polish evidence](../../docs/evidence/movies-polish/README.md)
for before/after screens, measured limits and manual follow-up checks.
