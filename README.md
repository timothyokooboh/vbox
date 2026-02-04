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
