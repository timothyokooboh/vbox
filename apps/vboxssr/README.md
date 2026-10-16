# VBox Nuxt SSR fixture

This workspace app demonstrates the unreleased explicit native interface with
Nuxt 4. It uses workspace packages, so build them from the repository root
first:

```sh
pnpm --filter '@veebox/*' build
pnpm --filter vboxssr dev
```

Open `/?theme=dark` or `/?theme=light`. The initial HTML contains reset/theme
CSS, component defaults and caller overrides before client JavaScript runs.
Controls exercise override withdrawal/restoration and actual NuxtLink theme
navigation.

For production verification:

```sh
pnpm --filter @vbox/acceptance test:nuxt
```

This builds the app and runs Chromium, Firefox and WebKit checks, including
JavaScript-disabled and delayed-hydration cases. See
[SSR integration and limits](../acceptance/SSR.md) for collector wiring, initial
theme expectations, supported rendering modes and the broader acceptance matrix.

## Native binding examples

`app/components/NativeBoundaryExamples.vue` keeps ordinary semantic spreads
separate from a typed grouped style binding, including the HTML/CSS `translate`
collision. `ForwardedSsrButton.vue` opts out of fallthrough with
`inheritAttrs: false`, then explicitly forwards `$attrs` to its button. The
caller's base color and left padding override matching internal defaults without
changing hover or the fragment's explanatory sibling. Withdrawal reveals the
internal values. All of these declarations are collected during the request,
before hydration.

The existing app also demonstrates custom property aliases, light/dark token
values, keyframes, theme-first responsive hover, single-root caller overrides,
actual NuxtLink navigation, and the supported legacy VBox interface. It does not
require a client-only wrapper or SSR import aliases.

## Types and editor setup

`nuxt.config.ts` extends Nuxt's generated app tsconfig through
`typescript.tsConfig.vueCompilerOptions.plugins`, pointing the workspace Volar
plugin at this app's config. Do not edit generated files under `.nuxt`.

```sh
pnpm --filter vboxssr exec vbox-type-gen
pnpm --filter vboxssr type-check
pnpm --filter @vbox/acceptance test:consumers
```

The last command includes real Nuxt development SSR/hydration checks as well as
the playground checks. Production is covered by `test:nuxt` above. No package
publication or deployment is needed. Native styling still has a temporary
compatibility path for other not-yet-migrated workspace apps; these examples do
not depend on unprefixed inference.
