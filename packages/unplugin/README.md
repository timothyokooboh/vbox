# @veebox/unplugin

Explicit native-template styling for Vue, with shared Vite and webpack adapters.

```ts
import { vboxVitePlugin } from '@veebox/unplugin/vite';
import { vboxWebpackPlugin } from '@veebox/unplugin/webpack';
```

Place the Vite adapter before the Vue plugin, or add the webpack adapter beside
`VueLoaderPlugin`. Register `VBoxPlugin` from `@veebox/vue` in the application.

```vue
<button type="button" vb-color="cl-brand" :vb-hover="{ color: 'red' }">
  Save
</button>
```

Use `:vb="styles"` for reusable style objects; ordinary `v-bind` remains
semantic. The compiler discovers root `vbox.config.*` aliases. Explicit
`aliases` replaces those discovered aliases; `rootDir` and `configPath` support
nonstandard paths.

The prepared native beta is not yet published. Node 22.14.0+ is the supported
baseline. This package ships prebuilt ESM; synchronous named `require` exports
use Node's ESM interop on that baseline. There is no consumer postinstall build
or pnpm requirement. Vite/webpack and their Vue integrations belong to the host
application. Other bundlers are not yet advertised as supported.

See the repository's native syntax, migration and component-targeting guides.
Multiple-root components must explicitly forward style bindings to their
intended root; VBox does not silently choose a root or add a wrapper.
