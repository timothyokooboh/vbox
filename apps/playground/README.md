# VBox native styling playground

This **workspace consumer** exercises the unreleased explicit styling interface.
It runs the built local core, Vue, unplugin, Volar and PVA packages, not
registry fallbacks. From the repository root:

```sh
pnpm install
pnpm --filter '@veebox/*' build
pnpm --filter @vbox/playground dev
```

After changing a package, rebuild it before testing the app. Production and type
checks are available separately:

```sh
pnpm --filter @vbox/playground type-check
pnpm --filter @vbox/playground build
pnpm --filter @vbox/playground preview
```

## Examples

The first panel in `src/examples/NativeApiExamples.vue` links these concepts:

- HTML `translate="no"` from an ordinary `v-bind` stays semantic while a typed
  `:vb` object supplies CSS `translate`. Intrinsic image dimensions coexist with
  explicitly styled dimensions.
- `CompositionExample.vue` combines readonly sources, direct bindings,
  null/false withdrawal, and both directions of shorthand/longhand conflicts.
- `ConditionsExample.vue` demonstrates theme-first hover, responsive thresholds,
  `disabled`/`_disabled`, `2xl`/`_2xl`, and the supported legacy VBox interface.
- `ComponentTargetsExample.vue` applies caller styles over PVA defaults. A
  fragment explicitly forwards `$attrs` to its button; VBox neither inserts a
  wrapper nor guesses a root. Hover remains red when the caller only changes
  resting color.

The existing product card, quantity controls, people grid, animation and
CSS-only carousel remain below this panel. Styling now uses `vb-*` and reusable
objects use `:vb`. Semantic props, listeners, conditional rendering and loops
remain ordinary Vue. Custom aliases (`cl`, `mTop`, `mBottom`, `onBorder`) come
from `vbox.config.ts`. The carousel intentionally demonstrates experimental
browser CSS: its scroll buttons/markers are not uniformly supported. Existing
remote imagery and icon fonts require a network connection; automated tests
block those requests and do not treat them as correctness dependencies.

## Editor

Use Vue (Official), with the local `@veebox/volar` configured in
`tsconfig.app.json`. Hover a token in a compound value or conditional object;
complete a `vb-*` key or a property-appropriate token value. Ordinary attributes
keep Vue's types and completion behavior. After changing theme/aliases, refresh
the reusable TypeScript declarations:

```sh
pnpm --filter @vbox/playground exec vbox-type-gen
```

Generated `vbox.d.ts` is committed with the examples. The plugin reads live
literal configuration for editor updates; generated declarations also serve
standalone TypeScript style objects.

## Regression checks

```sh
pnpm --filter @vbox/acceptance test:consumers
```

This checks the playground and Nuxt types, runs playground development and
production interactions in Chromium/Firefox/WebKit, and runs Nuxt development
SSR/hydration checks. `pnpm --filter @vbox/acceptance test:nuxt` separately
builds and verifies Nuxt production, including disabled/delayed JavaScript. Both
commands are part of the full acceptance suite. Browser tests observe rendered
styles and interactions, not generated class-name spellings.
