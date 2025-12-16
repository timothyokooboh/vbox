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

<<< @/examples/Example2.vue

<Example2 />

<script lang="ts" setup>
import Example2 from '../examples/Example2.vue'
</script>
