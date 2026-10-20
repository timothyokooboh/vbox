import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { VBoxPlugin, useVBoxStyleBinding, getSSRStyles } from '@veebox/vue';

/** Real public runtime/SSR boundary, with warnings surfaced on successful renders. */
export async function renderStyles(grouped, direct = {}, options = {}) {
  const app = createSSRApp({
    setup() {
      const bind = useVBoxStyleBinding();
      return () =>
        h('button', bind(direct, { translate: 'no' }, grouped), 'Styled');
    },
  }).use(VBoxPlugin, { enableDefaultTheme: false, ...options });
  const warnings = [];
  app.config.warnHandler = (message) => warnings.push(message);
  const context = {};
  const html = await renderToString(app, context);
  assert.deepEqual(warnings, []);
  return { html, css: getSSRStyles(context) };
}
