// server/plugins/vbox-ssr.ts
import { defineNitroPlugin } from 'nitropack/runtime';
import { getVboxSsrCss } from '../utils/vbox-ssr-shared.mjs';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const css = getVboxSsrCss(event?.context);

    if (css) {
      html.head.push(`<style id="vbox-ssr">${css}</style>`);
    }
  });
});
