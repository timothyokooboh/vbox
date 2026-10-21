# VBox

Style Vue applications with expressive attributes and props, directly on
semantic HTML and component instances. Keep CSS property names, design tokens,
responsive styles, and interaction states without hiding your markup behind
wrapper tags.

> This branch documents the unreleased native API. The published polymorphic
> `<v-box>` component remains supported. Do not treat an intermediate stack
> branch as a beta release.

## Install and Configure

Install `@veebox/core` and `@veebox/vue`, and add `@veebox/unplugin` as a
development dependency using npm, pnpm, or Yarn. Register the runtime once:

```ts
import { createApp } from 'vue';
import { VBoxPlugin } from '@veebox/vue';
import App from './App.vue';
import config from './vbox.config';

createApp(App).use(VBoxPlugin, config).mount('#app');
```

For Vite, place VBox before Vue:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vboxVitePlugin } from '@veebox/unplugin/vite';

export default defineConfig({ plugins: [vboxVitePlugin(), vue()] });
```

For webpack, add `vboxWebpackPlugin()` from `@veebox/unplugin/webpack` to your
plugins alongside VueLoaderPlugin. Keep your normal Vue/TypeScript loader setup.
Both adapters share the same transform and discover `vbox.config.*` for tooling
metadata. `configPath` and `rootDir` support non-standard locations; explicit
`aliases` replaces discovered custom alias metadata, not runtime configuration.

## Explicit Styling, Ordinary HTML

```vue
<template>
  <button
    type="button"
    translate="no"
    vb-color="white"
    vb-bg="cl-blue-600"
    :vb-hover="{ bg: 'cl-blue-700' }"
    :vb-md="{ padding: '24px' }"
  >
    Save
  </button>
</template>
```

`vb-*` belongs to styling. Unprefixed attributes, ordinary `v-bind`, and dynamic
argument names retain Vue/HTML semantics. Bind reusable style objects or ordered
arrays with `:vb="styles"`; object keys need no prefix. Individual style
bindings win over grouped bindings. Existing `_disabled` and `_2xl` keys remain
supported alongside clean `disabled` and `2xl` spellings.

Custom components use the same syntax. Single-root components forward generated
classes normally; fragment components must explicitly forward attributes to the
intended root. VBox never inserts a wrapper or silently selects a fragment root.
Parent styling overrides matching internal styles, but a base override does not
wipe out internal hover, theme, or query states. See the detailed precedence
contract in the native styling documentation.

The unpublished `vbox`/`vbox-ignore` markers and inference options
`parseAllComponents`, `forceStyleAttrs`, and `forceSemanticAttrs` are retired.
Remove them; explicit bindings need no marker. Unknown `vb-*` properties remain
styling and receive advisory guidance, rather than becoming semantic attributes.

## Published Component Compatibility

```vue
<v-box is="p" color="red" :hover="{ color: 'blue' }">Hello</v-box>
```

The published component retains its unprefixed props, aliases, `asChild`,
tokens, and configuration. Its children do not implicitly enter a styling scope.

## Editor Support

Install `@veebox/volar` as a development dependency and use Vue - Official in VS
Code. Add this to the application's TypeScript config, not `package.json`:

```json
{
  "vueCompilerOptions": {
    "plugins": ["@veebox/volar"]
  }
}
```

The plugin supplies contextual namespace completions, token-value completions,
and informational token previews on native and custom-component attributes.
Unknown explicit property names provide hover guidance without rejecting future
CSS. Token previews describe configuration, not browser-computed styles.

## Documentation and Demos

- [Native styling contract](apps/docs/docs/guide/essentials/native-syntax.md)
- [SSR collection and Nuxt setup](apps/docs/docs/up-next/ssr-support.md)
- [Movies and Atelier demos](apps/docs/docs/demos/applications.md)
- [Acceptance coverage](apps/acceptance/README.md)

SSR requires request-local collection and critical CSS injection; SSR-safe
imports alone do not prevent a flash of unstyled content. Follow the SSR
integration guide.

The namespace preserves native elements for accessibility tooling; it does not
make an application automatically WCAG conformant. Test semantics, focus,
keyboard operation, contrast, reduced motion, and assistive technology behavior.
