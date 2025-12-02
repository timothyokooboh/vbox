# VBOX

A polymorphic Vue.js component with a lightweight runtime styling engine

# Installation

To install VBox in your Vue.js project, use any of the following package
managers:

::: code-group

```bash [npm]
npm install @vbox/core @vbox/vue
```

```bash [pnpm]
pnpm add @vbox/core @vbox/vue
```

```bash [yarn]
yarn add @vbox/core @vbox/vue
```

:::

Then, import and register the plugin globally.

```js
import { createApp } from "vue";
import App from "./App.vue";
import { VBoxPlugin } from "@vbox/vue";

const app = createApp(App);
app.use(VBoxPlugin);
app.mount("#app");
```

Internally, the plugin registers the `VBox` component globally. Now you can use
the component in your Vue templates to style elements.

```html
<template>
  <v-box
    is="img"
    src="https://cdn.punchng.com/wp-content/uploads/2025/06/29021242/Victor-Osimhen.jpg"
    alt="Victor Osihmen"
    height="48px"
    width="48px"
    object-fit="cover"
    border-radius="50%"
  />
</template>
```
