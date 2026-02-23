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

## Usage (Scoped API, Recommended)

```vue
<template>
  <v-box p="sp-4" bg="cl-slate-100">
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
  </v-box>
</template>
```

## Rules

1. `<v-box>` enables scoped parsing for native descendants.
2. Object style props must use bound expressions.
3. Invalid: `hover="{ color: 'red' }"`.
4. Valid: `:hover="{ color: 'red' }"`.
5. Use `vbox-ignore` to skip transform on an element subtree.
6. If you define custom aliases in `vbox.config.ts`, pass their keys to the plugin:

```ts
vboxNativePlugin({
  aliases: Object.keys(vboxConfig.aliases?.values ?? {}),
});
```

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
4. Native tags get VBox IntelliSense when `@veebox/vue` types are included.
5. Alias keys autocomplete in both `camelCase` and `kebab-case` forms (for example `maxW` and `max-w`).
6. For hover previews of token values in templates, register `@veebox/volar` in `vueCompilerOptions.plugins`.
