# Installation

::: warning Upcoming beta

This guide describes the upcoming explicit native API. It is not available in
the currently published stable release. Until the beta is published, use
matching built workspace packages. The `@beta` commands below are for that
release; do not mix an older core/Vue package with the new compiler/editor
packages.

:::

## Packages

Add the runtime packages to an existing Vue 3 application, and the
compiler/editor packages as development dependencies. Choose one package
manager:

::: code-group

```sh [npm]
npm install @veebox/core@beta @veebox/vue@beta
npm install -D @veebox/unplugin@beta @veebox/volar@beta
```

```sh [pnpm]
pnpm add @veebox/core@beta @veebox/vue@beta
pnpm add -D @veebox/unplugin@beta @veebox/volar@beta
```

```sh [yarn]
yarn add @veebox/core@beta @veebox/vue@beta
yarn add -D @veebox/unplugin@beta @veebox/volar@beta
```

:::

The compiler is required for `vb-*` and `:vb`; the runtime plugin alone does not
teach Vue that syntax. No Tailwind, Sass or special Babel transform is required.
The supported [legacy VBox component](./essentials/polymorphism.md) can still be
used without the native compiler. Volar supplies editor behavior, not
compilation.

## Shared app setup

The files below are compiled, typechecked and browser-tested with both bundlers.
This example deliberately uses a nonstandard config location to demonstrate that
runtime, compiler, editor and type generation must resolve the **same config**.
For a normal root `vbox.config.ts`, the tools discover it automatically and you
can omit `configPath` / `rootDir`.

Create `theme/vbox.config.ts`:

<<< @/examples/setup/theme/vbox.config.ts

`cssResets` adds the packaged resets. The color token has light and dark values;
`html.dark` switches it. Custom aliases describe runtime mappings. The partial
breakpoint config changes `md` without discarding other defaults.

Register the runtime in `main.ts`:

<<< @/examples/setup/main.ts

Use separate semantic and style bindings in `App.vue`:

<<< @/examples/setup/App.vue

`translate="no"` remains an HTML attribute while `:vb` applies CSS translation.
`vb-brand-color` and `vb-pad2` use the custom aliases. The theme button is a
minimal example; an SSR app should choose its initial theme before paint, not
after mount.

## Vite

Install Vite and its Vue plugin using the versions supported by your app (this
workspace exercises Vite 7 and Vue plugin 6). Add `vite.config.ts`:

<<< @/examples/setup/vite.config.ts

Keep VBox before Vue so the style namespace is transformed before Vue compiles
the template. The plugin also declares `enforce: 'pre'`.

A minimal `index.html` points to the shared entry:

<<< @/examples/setup/index.html

Use `vite` for development and `vite build` for production. Existing app scripts
such as `npm run dev` can keep invoking those commands.

## webpack 5

Install `webpack`, `webpack-cli`, `vue-loader` (17), `ts-loader`,
`html-webpack-plugin`, TypeScript and Vue's matching `@vue/compiler-sfc` as dev
dependencies. For a dev server, add `webpack-dev-server`. Configure
`webpack.config.mjs`:

<<< @/examples/setup/webpack.config.mjs

Use `webpack --config webpack.config.mjs` to build, or
`webpack serve --config webpack.config.mjs --mode development` to develop. The
wrapper shares the Vue transform with Vite; no consumer alias to VBox's ESM or
UMD bundle is needed. `ts-loader` transpiles here; run `vue-tsc --noEmit`
separately so type errors cannot be hidden by transpile-only builds. The
JavaScript config passes a path instead of importing a TypeScript config through
plain Node.

## Editor and type generation

Use Vue (Official) or a compatible Vue language-tools integration, with
TypeScript and `vue-tsc` installed in the app. Here is the standalone example's
`tsconfig.json`:

<<< @/examples/setup/tsconfig.json

For a scaffolded Vue app, preserve its existing configuration and add the
`vueCompilerOptions` block to the app's tsconfig, plus the config/generated
files to its `include`. Do not place that block in `package.json`.

Generate `vbox.d.ts` using the public CLI after changing aliases or theme
tokens:

::: code-group

```sh [npm]
npx vbox-type-gen --config ./theme/vbox.config.ts
npx vue-tsc --noEmit
```

```sh [pnpm]
pnpm exec vbox-type-gen --config ./theme/vbox.config.ts
pnpm exec vue-tsc --noEmit
```

```sh [yarn]
yarn vbox-type-gen --config ./theme/vbox.config.ts
yarn vue-tsc --noEmit
```

:::

The compiler discovers custom aliases from the config. If supplied explicitly,
`aliases: ['brandColor']` **replaces** the discovered custom alias-key list
rather than adding to it; it does not define the runtime property mapping. See
[custom aliases](./customization/custom-aliases.md) and
[editor configuration](../up-next/enhanced-dx.md) for the matching editor
override and literal/snapshot preview limits.

## Nuxt and VitePress

Use the [tested SSR/SSG integrations](../up-next/ssr-support.md), including
request-local critical CSS and initial theme handling. Do not wrap native
styling in `ClientOnly` merely to avoid SSR setup.

In this repository, build the workspace packages before running the docs. The
verification command `pnpm --filter @vbox/acceptance test:docs` runs the public
starter files and the rendered docs in Chromium, Firefox and WebKit. Package
installation against published tarballs is a separate release-readiness check;
these workspace tests do not assert that an unpublished beta already exists.
