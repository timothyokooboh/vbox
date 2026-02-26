# Installation

::: code-group

```bash [npm]
npm install @veebox/core @veebox/vue
```

```bash [pnpm]
pnpm add @veebox/core @veebox/vue
```

```bash [yarn]
yarn add @veebox/core @veebox/vue
```

:::

Then, import and register the plugin globally.

```js
import { createApp } from 'vue';
import App from './App.vue';
import { VBoxPlugin } from '@veebox/vue';

const app = createApp(App);
app.use(VBoxPlugin);
app.mount('#app');
```

Next, run `npx vbox-type-gen` to generate a `vbox.d.ts` file that provides type
definitions for the [default theme](./essentials/default-theme.md).

::: info

If using TypeScript, add `vbox.d.ts` to your `tsconfig.json` under the `include`
array for type-safety and autocompletion support.

:::

Internally, the plugin registers the `VBox` component globally. Now you can use
the component in your Vue templates to style elements.

<<< @/examples/ExampleTwo.vue

<ExampleTwo />

<script lang="ts" setup>
import ExampleTwo from '../examples/ExampleTwo.vue'
</script>

## Optional: Native Syntax Transform

If you want native tags with VBox attributes (`<p vbox color=\"red\">`), install
and register the transform plugin:

```bash
pnpm add @veebox/unplugin
```

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
      // Optional: parse all custom components globally.
      // parseAllComponents: true,
      // Optional safety overrides for edge-case attr collisions:
      // forceSemanticAttrs: ['src'],
      // forceStyleAttrs: ['myCustomStyleAttr'],
    }),
    vue(),
  ],
});
```

## Optional: IDE Token Hover Previews

If you want hover previews for token values like `fs-xl -> 1.25rem` or
`cl-brand -> #c52341`, install the Volar plugin:

```bash
pnpm add -D @veebox/volar
```

Then register it in your `tsconfig.json`:

```json
{
  "vueCompilerOptions": {
    "plugins": ["@veebox/volar"]
  }
}
```

You can also pass options:

```json
{
  "vueCompilerOptions": {
    "plugins": [
      {
        "name": "@veebox/volar",
        "configPath": "./vbox.config.ts",
        "parseAllComponents": false
      }
    ]
  }
}
```

Current behavior:

1. Works for static token literals in template attributes (for example `color="cl-brand"`).
2. Does not resolve dynamic expressions like `:color="tokenName"` at hover time.
