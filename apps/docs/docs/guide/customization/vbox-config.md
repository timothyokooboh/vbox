# VBox Config

VBox allows you to customize various aspects of its behavior and styling through a configuration object. You can customize options like `classNamePrefix`, `aliases`, `breakpoints`, and `theme`.

While you can pass the configuration directly when registering the plugin through `app.use()`, it's recommended to create a separate `vbox.config.ts` or `vbox.config.js` file so that running `npx vbox-type-gen` can automatically pick up the configuration and update the generated types accordingly.

```ts
import { createApp } from 'vue'
import { VBoxPlugin } from '@veebox/vue'
import App from './App.vue'
import vboxConfig from './vbox.config.ts'

const app = createApp(App)
app.use(VBoxPlugin, vboxConfig)
app.mount('#app')
```

::: info
Make sure that `vbox.config.js` or `vbox.config.ts` is located at the root of your Vue.js project.

And if you're using TypeScript, ensure that both `vbox.config.ts` and `vbox.d.ts` are included in your `tsconfig.json` file's `include` array.

`vbox.d.ts` is the generated types file created when you run `npx vbox-type-gen` to update the types based on your custom configuration. This ensure proper Intellisense support in your IDE.
:::
