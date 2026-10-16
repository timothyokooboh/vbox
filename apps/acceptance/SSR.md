# SSR and hydration - ticket #10

## Supported integrations

The executable fixtures cover **buffered** Vue `renderToString` rendering with
independently built Vite and webpack server/client entries, and a real Nuxt 4
Nitro production server. They do not establish streaming, edge-worker, or every
Nitro deployment-preset compatibility. No browser globals are required to render.

Use the same initial component data, configuration, owner tree and theme on the
server and client. The plugin collects its reset/theme prelude while rendering
stateful Vue components (including SFCs). A purely functional root with no
stateful descendants does not run Vue's global lifecycle mixins: use an SFC or
stateful application shell when relying on automatic prelude collection.

## Framework-agnostic Vue integration

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
  return { html, css };
}
```

Create an app/context per request. Put the collected CSS in the response head
**before** the rendered body, not in a mounted hook. Do not reuse a process-global
collector for requests. `getSSRCollector(context)` still exposes the public
collector, including `reset()`. `getSSRStyles(context)` reads its current output.
CSS should come from trusted authored styles; this fixture is not an HTML/CSS
sanitizer for arbitrary user input. Apply the host application's CSP/nonce policy
when embedding inline CSS.

`cssResets: true` precedes the theme-variable definitions in the collected
prelude; structured styling follows. Keyframes use the same request collector:

```ts
const collector = getSSRCollector(useSSRContext()!); // server-side setup only
const animationName = keyframes('fade', { from: { opacity: 0 }, to: { opacity: 1 } }, { collector });
```

On the client, omit `collector` to use the client registry. The same definition
produces the same identity even when `CSS.supports` is absent or disagrees with
the server's available APIs. Unsupported future declarations remain authored CSS;
the browser decides which declarations it understands.

## Initial theme

Choose the initial `html.dark` class before first paint, from server-readable
state such as a cookie, or from an appropriate pre-paint bootstrap. Keep it
consistent with the hydration state. Changing a light server response to dark
only in `onMounted` can still cause a theme flash; SSR safety cannot discover
client-only preferences. Tests use an explicit `?theme=dark` source on both sides.

## Nuxt integration

`apps/vboxssr/app/plugins/vbox.ts` installs the shared configuration on both
server and client. Its SFC app exercises native styling, a forwarded single-root
component, legacy VBox, theme/interaction/breakpoint nesting and keyframes.
The public collector bridges Vue's SSR context to `event.context`.

`server/plugins/vbox-ssr.ts` uses Nuxt's `defineNitroPlugin` auto-import and the
`render:html` hook to insert collected CSS into the head. Supporting utilities
live in `server/utils`, **not** `server/plugins`, where Nitro expects a default
plugin export. No Nitro-internal virtual modules are imported. Real `NuxtLink`
navigation changes the theme after hydration without replacing the root app.

## Evidence and commands

- `tests/ssr.test.mjs`: public built-package API; prelude/reset, keyframe identity,
  absent/different validation APIs, twelve concurrent request/config combinations.
- `tests/renderers.test.mjs`: both independent SSR bundles render identical CSS
  without browser globals; no hardcoded generated class names.
- `tests/browser/ssr.spec.ts`: initial appearance with JavaScript disabled, then
  delayed-script hydration without `window.CSS`, matching class/animation
  identity, theme-first hover, override withdrawal, lazy navigation/shared styles.
- `tests/nuxt/ssr.spec.ts`: the actual Nuxt production server, initial dark CSS
  without scripts, delayed hydration with validation returning false, override
  updates and route/theme changes. Browser fixtures reject hydration/page errors.

Run `pnpm --filter @vbox/acceptance test` for the full matrix, or
`pnpm --filter @vbox/acceptance test:nuxt` to rebuild and test Nuxt alone.
After a Nuxt build, run `pnpm --filter @vbox/acceptance exec playwright test
--config playwright.nuxt.config.ts` for a focused browser rerun. All three
browsers run against each integration. Local fixture servers use loopback only;
ports 4721, 4722 and 4723 must be available.
