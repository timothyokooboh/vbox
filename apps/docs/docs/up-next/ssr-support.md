# Full SSR Support

VBox currently works out of the box in client-rendered Vue applications. For SSR
setups (for example, Nuxt with SSR enabled), styles must be collected during the
server render and injected into the HTML head to avoid a flash of unstyled
content.

## How SSR Works

During SSR, `VBox` does not inject styles into the DOM. Instead it collects the
generated CSS into the Vue SSR context. After rendering, you can read the
collected CSS and insert it into the HTML response.

This approach is build-tool agnostic and works with any SSR setup.

## Vue SSR Usage

```ts
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { VBoxPlugin, VBOX_SSR_COLLECTOR_KEY } from '@veebox/vue';
import App from './App.vue';

const app = createSSRApp(App);
app.use(VBoxPlugin);

const ctx = {};
const html = await renderToString(app, ctx);
const css = ctx[VBOX_SSR_COLLECTOR_KEY]?.getCss() ?? '';

// Inject into the HTML head
const head = `<style id="vbox-ssr">${css}</style>`;
```

You can also use `getSSRStyles(ctx)` from `@veebox/vue` to read the CSS.

## Nux.js

In Nuxt, you can read the SSR context in a server plugin or renderer hook and
append the collected CSS into the head. The key is the same:
`VBOX_SSR_COLLECTOR_KEY`.

### Nuxt Server Plugin Example

```ts
// server/plugins/vbox-ssr.ts
import { defineNitroPlugin } from 'nitropack/runtime';
import { VBOX_SSR_COLLECTOR_KEY } from '@veebox/vue';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const ctx = event?.context as Record<string, unknown> | undefined;
    const css =
      (
        ctx?.[VBOX_SSR_COLLECTOR_KEY] as { getCss?: () => string } | undefined
      )?.getCss?.() ?? '';

    if (css) {
      html.head.push(`<style id="vbox-ssr">${css}</style>`);
    }
  });
});
```

The collector is also mirrored onto `event.context` automatically, so you can
read it directly in the `render:html` hook as shown above.

## SSR Checklist

- Ensure the Vue app installs `VBoxPlugin` during SSR.
- Render with a fresh SSR context per request.
- Read styles from `ctx[VBOX_SSR_COLLECTOR_KEY]`.
- Inject the resulting CSS into the HTML `<head>` before sending the response.
- Make sure the style tag is included before hydration to avoid FOUC.
