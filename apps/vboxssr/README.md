# VBox Nuxt SSR fixture

This workspace app demonstrates the unreleased explicit native interface with
Nuxt 4. It uses workspace packages, so build them from the repository root first:

```sh
pnpm --filter '@veebox/*' build
pnpm --filter vboxssr dev
```

Open `/?theme=dark` or `/?theme=light`. The initial HTML contains reset/theme CSS,
component defaults and caller overrides before client JavaScript runs. Controls
exercise override withdrawal/restoration and actual NuxtLink theme navigation.

For production verification:

```sh
pnpm --filter @vbox/acceptance test:nuxt
```

This builds the app and runs Chromium, Firefox and WebKit checks, including
JavaScript-disabled and delayed-hydration cases. See
[SSR integration and limits](../acceptance/SSR.md) for collector wiring, initial
theme expectations, supported rendering modes and the broader acceptance matrix.
