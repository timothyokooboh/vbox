# VBox Config

Keep runtime, compiler, editor and generated types aligned around one config.
Use `defineConfig` to preserve literal token and alias metadata:

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';
export default defineConfig({
  cssResets: true,
  theme: { color: { brand: { default: '#123456', dark: '#abcdef' } } },
});
```

Import that object when installing `VBoxPlugin`:

```ts
import { createApp } from 'vue';
import { VBoxPlugin } from '@veebox/vue';
import App from './App.vue';
import config from './vbox.config';
createApp(App).use(VBoxPlugin, config).mount('#app');
```

A root `vbox.config.ts` / `vbox.config.js` is the conventional discovery
location, not a requirement. Nonstandard layouts can set `configPath` and, if
necessary, `rootDir` on the compiler/editor and pass `--config` / `--root` to
`vbox-type-gen`. The [executable installation example](../installation.md) keeps
its config under `theme/` and demonstrates all four consumers.

Run `npx vbox-type-gen` after changes and include `vbox.d.ts` and the config in
the app's TypeScript project. Do not edit the generated declaration file
manually.

Customize [aliases](./custom-aliases.md),
[breakpoints](./responsive-breakpoints.md), [theme tokens](./theme.md),
[class prefixes](./classname-prefix.md) or [resets](./css-resets.md) without
changing the explicit `vb-*` / `:vb` boundary.
