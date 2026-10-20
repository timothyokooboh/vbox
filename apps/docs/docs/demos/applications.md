# Application showcases

These complete Vue applications exercise VBox's explicit native styling in two
different build pipelines. Semantic attributes and component props stay ordinary
Vue bindings; `vb-*` and `:vb` carry styling. Both use workspace VBox packages,
Radix Vue primitives, PVA variants and light/dark design tokens.

No hosted deployment is promised by this beta preparation. Run the examples
locally from the repository; their source links point to the main branch and
become available there when the reviewed release stack is merged.

## Movies: Vite

A cinema-inspired browsing experience with search, details, trailers and a
persistent theme switch. Search waits 1500 ms before fetching. Live browsing
requires your own TMDB API key; the automated tests use controlled HTTP fixtures
and do not require a real credential.

[Movies source](https://github.com/timothyokooboh/vbox/tree/main/apps/movies)
contains setup and environment instructions.

```sh
pnpm --filter @vbox/movies dev
```

## Atelier: webpack

An editorial art-discovery gallery: submit a title/artist search, inspect an
artwork in a keyboard-accessible dialog, then return to the same results. The
Art Institute of Chicago public API requires no key. Only museum-designated
public-domain records are shown; missing/withdrawn images and unavailable
responses have explicit fallback states. This independent demo is not endorsed
by the museum and does not make new rights guarantees.

[Atelier source](https://github.com/timothyokooboh/vbox/tree/main/apps/atelier)
contains the product brief, source/licensing notes and verification commands.

```sh
pnpm --filter @vbox/atelier dev
```

## Run and verify

Build the workspace packages before starting either app:

```sh
pnpm install
pnpm --filter '@veebox/*' build
pnpm --filter @vbox/acceptance test:movies
pnpm --filter @vbox/acceptance test:atelier
```

Both acceptance commands exercise real development and production builds in
Chromium, Firefox and WebKit with deterministic HTTP responses and synthetic
artwork. They cover themes, keyboard/focus behavior, responsive layouts, reduced
motion, loading and error states. Automated accessibility checks are useful
regressions, not WCAG certification; manual assistive-technology, zoom and
real-device review is still necessary.
