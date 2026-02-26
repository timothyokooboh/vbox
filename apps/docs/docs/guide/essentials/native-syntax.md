# Native Syntax

VBox supports native semantic tags with VBox-style attributes through a
compile-time transform.

## Why

This syntax keeps templates readable and improves static accessibility analysis,
since the source still contains real HTML tags like `<p>`, `<section>`, and
`<button>`.

## Setup

Install the transform package:

```bash
pnpm add @veebox/unplugin
```

Enable it in Vite:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vboxNativePlugin } from '@veebox/unplugin/vite';
import vboxConfig from './vbox.config';

export default defineConfig({
  plugins: [
    vboxNativePlugin({
      aliases: Object.keys(vboxConfig.aliases?.values ?? {}),
    }),
    vue(),
  ],
});
```

Enable it in Nuxt:

```ts
import { vboxNativePlugin } from '@veebox/unplugin/vite';

export default defineNuxtConfig({
  vite: {
    plugins: [vboxNativePlugin()],
  },
});
```

## Usage (Global Native Parsing)

```vue
<template>
  <section>
    <h2 color="cl-blue-700" fs="fs-2xl">Native VBox Syntax</h2>
    <p color="cl-slate-800">Styled native paragraph.</p>
    <button
      aria-label="save"
      bg="cl-emerald-600"
      color="white"
      :hover="{ backgroundColor: 'var(--color-emerald-700)' }"
    >
      Save
    </button>
  </section>
</template>
```

Framework link components are parsed by default:

```vue
<template>
  <router-link color="blue" to="/">Parsed</router-link>
  <nuxt-link color="blue" to="/">Parsed</nuxt-link>
</template>
```

Other custom components are parsed only when explicitly marked:

```vue
<template>
  <BaseButton color="blue">Not parsed</BaseButton>
  <BaseButton vbox color="blue" fs="fs-lg">Parsed</BaseButton>
</template>
```

## Rules

1. Native HTML tags are parsed globally in Vue templates.
2. Object style props must use bound expressions.
3. Invalid: `hover="{ color: 'red' }"`.
4. Valid: `:hover="{ color: 'red' }"`.
5. `router-link` and `nuxt-link` are parsed by default.
6. Other custom components are parsed only when they include the `vbox` marker.
7. Use `vbox-ignore` to skip transform on an element subtree.
8. Set `parseAllComponents: true` if you intentionally want all custom components parsed.
9. If you define custom aliases in `vbox.config.ts`, pass their keys to the plugin:

```ts
vboxNativePlugin({
  aliases: Object.keys(vboxConfig.aliases?.values ?? {}),
  parseAllComponents: false, // set true only if you want global custom-component parsing
  forceStyleAttrs: ['src'],
  forceSemanticAttrs: ['width'],
});
```

Use overrides only for edge-cases:

1. `forceSemanticAttrs`: keep attributes semantic even if they collide with CSS-like keys.
2. `forceStyleAttrs`: force attributes into VBox style parsing.

Supported object style keys:

- `mq`
- `cq`
- `dark`
- `declarations`
- `pseudos`
- `hover`
- `focus`
- `focusVisible`
- `focusWithin`
- `active`
- `_disabled`
- `sm`
- `md`
- `lg`
- `xl`
- `_2xl`

## Notes

1. This feature is global opt-in via plugin setup.
2. Existing `<v-box>` usage remains fully supported.
3. Legacy per-element marker mode is still available: `<p vbox color="red">`.
4. For custom components, `v-vbox-runtime` works reliably only when the component renders a single root element and allows directive inheritance to root. Components with fragments/multiple roots can break this behavior.
5. Native tags get VBox IntelliSense when `@veebox/vue` types are included.
6. Alias keys autocomplete in both `camelCase` and `kebab-case` forms (for example `maxW` and `max-w`).
7. For hover previews of token values in templates, register `@veebox/volar` in `vueCompilerOptions.plugins`.
