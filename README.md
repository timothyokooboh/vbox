# VBOX

A polymorphic Vue.js component with a lightweight runtime styling engine

# Installation

```bash [npm]
npm install @veebox/core @veebox/vue
```

```bash [pnpm]
pnpm add @veebox/core @veebox/vue
```

```bash [yarn]
yarn add @veebox/core @veebox/vue
```

Then, import and register the plugin globally.

```js
import { createApp } from 'vue';
import App from './App.vue';
import { VBoxPlugin } from '@veebox/vue';

const app = createApp(App);
app.use(VBoxPlugin);
app.mount('#app');
```

Internally, the plugin registers the `VBox` component globally. Now you can use
the component in your Vue templates to style elements.

```html
<template>
  <v-box
    is="img"
    src="./images/victor-osihmen.jpg"
    alt="Victor Osimhen"
    height="48px"
    width="48px"
    object-fit="cover"
    border-radius="50%"
  />
</template>
```

## SSR (Nuxt)

VBox supports SSR without a flash of unstyled content by collecting styles
during server render and injecting them into the HTML head.

1. Install the VBox plugin in Nuxt as usual:

```ts
// app/plugins/vbox.ts
import { VBoxPlugin } from '@veebox/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VBoxPlugin);
});
```

2. Add a Nitro server plugin to inject the collected CSS:

```ts
// server/plugins/vbox-ssr.ts
import { defineNitroPlugin } from 'nitropack/runtime';
import { VBOX_SSR_COLLECTOR_KEY } from '@veebox/vue';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const ctx = event?.context as Record<string, unknown> | undefined;
    const css =
      (ctx?.[VBOX_SSR_COLLECTOR_KEY] as { getCss?: () => string } | undefined)
        ?.getCss?.() ?? '';

    if (css) {
      html.head.push(`<style id="vbox-ssr">${css}</style>`);
    }
  });
});
```

[Documentation](https://veebox.xyz/)

## Native Tag Syntax (Compile-time Transform)

If you want to keep semantic native tags while still using VBox style attributes,
enable the `@veebox/unplugin` transform.

### Install

```bash
pnpm add @veebox/unplugin
```

### Vite Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vboxNativePlugin } from '@veebox/unplugin/vite';
import vboxConfig from './vbox.config';

export default defineConfig({
  plugins: [
    vboxNativePlugin({
      aliases: Object.keys(vboxConfig.aliases?.values ?? {}),
      // Optional edge-case overrides:
      // forceSemanticAttrs: ['src'],
      // forceStyleAttrs: ['myCustomStyleAttr'],
    }),
    vue(),
  ],
});
```

### Nuxt Setup

```ts
// nuxt.config.ts
import { vboxNativePlugin } from '@veebox/unplugin/vite';

export default defineNuxtConfig({
  vite: {
    plugins: [vboxNativePlugin()],
  },
});
```

### Usage (Global Native Parsing)

```vue
<template>
  <section>
    <h1 color="red" fs="fs-4xl">Title</h1>
    <p color="cl-slate-800">Body copy</p>
    <button
      aria-label="Save"
      bg="cl-blue-600"
      color="white"
      :hover="{ backgroundColor: 'var(--color-blue-700)' }"
    >
      Save
    </button>
  </section>
</template>
```

Rules:

1. Native HTML tags are parsed globally in Vue templates.
2. Object style props must use bound syntax, e.g. `:hover`, `:mq`, `:cq`.
3. String object literals are rejected, e.g. `hover="{ ... }"` is invalid.
4. `router-link` and `nuxt-link` are parsed by default.
5. Other custom components are parsed only when marked with `vbox`.
6. Set `parseAllComponents: true` to parse all custom components globally.
7. Use `vbox-ignore` on any element to skip transform for that subtree.
8. If you use custom aliases in `vbox.config.ts`, pass them to the plugin via `aliases`.

Legacy per-element mode is still supported:

```vue
<p vbox color="red">Hello</p>
<BaseButton vbox color="blue">Sign in</BaseButton>
```

For custom components, `v-vbox-runtime` works reliably only when the component renders a single root element and allows directive inheritance to root. Components with fragments/multiple roots can break this behavior.

## IDE Token Hover Previews (Volar)

To show resolved token values on hover in `.vue` templates (for example
`fs-xl => 1.25rem`), install and register the Volar plugin:

```bash
pnpm add -D @veebox/volar
```

```json
{
  "vueCompilerOptions": {
    "plugins": ["@veebox/volar"]
  }
}
```
