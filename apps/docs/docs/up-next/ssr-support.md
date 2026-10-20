# SSR and Hydration

VBox renders without browser globals. SSR safety still requires **collecting CSS
per request and embedding it before the rendered content**. An SSR-safe runtime
alone cannot prevent a flash if the host omits the stylesheet or chooses the
initial theme only after mounting.

## Vue SSR

```ts
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { VBoxPlugin, getSSRStyles } from '@veebox/vue';
import App from './App.vue';
import config from './vbox.config';

export async function render() {
  const app = createSSRApp(App).use(VBoxPlugin, config);
  const context = {};
  const html = await renderToString(app, context);
  const css = getSSRStyles(context);
  return { html, css }; // put CSS in the response head before sending the body
}
```

Create a fresh app/context per request. Never reuse a global collector across
requests. `getSSRCollector(context)` exposes the collector when explicitly
needed; `getSSRStyles(context)` reads it. Reset/theme CSS precedes structured
declarations. Use the same config, initial data and component-owner tree on both
sides.

## Nuxt

These are the files used by the executable workspace Nuxt consumer. Keep helper
modules in `server/utils`, not `server/plugins`, where Nitro expects a default
plugin export. Use Nuxt's `defineNitroPlugin` auto-import rather than importing
Nitro internal runtime/virtual modules.

### Compiler and editor configuration

<<< @/../../vboxssr/nuxt.config.ts

The absolute config path anchors editor resolution even though Nuxt generates
its app tsconfig under `.nuxt`. Install matching workspace/beta packages for
core, Vue, unplugin and Volar. Nuxt's normal TypeScript dependencies still
apply.

### Shared Vue plugin

<<< @/../../vboxssr/app/plugins/vbox.ts

### Server collector reader

<<< @/../../vboxssr/server/utils/vbox-ssr-shared.mjs

### Head injection

<<< @/../../vboxssr/server/plugins/vbox-ssr.ts

The Vue integration mirrors its request collector onto the Nitro event context.
No extra `vue:setup` bridge, client-only wrapper, UMD alias or blanket
`ssr.noExternal` workaround is required for the tested package exports.

## VitePress

This docs site is also a real SSG consumer. Its theme installs `VBoxPlugin`, and
its build uses these hooks to move page-local collected CSS into the HTML head:

<<< @/.vitepress/vbox-ssg.ts

Spread `vboxSsgHooks` into `defineConfig`, and register `vboxVitePlugin()` in
the config's `vite.plugins`. `postRender` receives the Vue SSR context;
`transformHtml` receives the final HTML, not that same context. The per-page
transport avoids a shared process-global CSS accumulator and keeps style tags
out of the hydrated app tree. These hooks target the tested VitePress
2.0.0-alpha.15 API; adapt the host integration if its rendering hooks change.

## Checklist and limits

- Install `VBoxPlugin` on both server and client; use a stateful/SFC application
  shell. A purely functional root with no stateful descendants does not run the
  automatic prelude lifecycle hook.
- Put request-local collected CSS in the initial head. Inline CSS must follow
  your CSP/nonce policy and come from trusted authored styles, not unsanitized
  user input. This integration is not an HTML/CSS sanitizer.
- Set initial `html.dark` before first paint from server-readable state or an
  appropriate pre-paint bootstrap; keep hydration state consistent. A
  mounted-only theme change can still flash.
- Collect keyframes with the same request collector; see
  [keyframes](../guide/essentials/keyframes.md).
- Verify with JavaScript disabled, delayed hydration, navigation,
  responsive/theme interactions and caller override withdrawal. `CSS.supports`
  being absent or returning a different answer must not change generated
  identity.
- Evidence covers buffered Vue SSR with Vite/webpack, Nuxt 4's tested Node Nitro
  server, and this VitePress SSG integration. It does not establish streaming,
  every deployment preset, edge workers or every third-party component library.

The repository commands `pnpm --filter @vbox/acceptance test:nuxt` and
`pnpm --filter @vbox/acceptance test:consumers` exercise the actual Nuxt and
playground applications. No publication or deployment is necessary.
