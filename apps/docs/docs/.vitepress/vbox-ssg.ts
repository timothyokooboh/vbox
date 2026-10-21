import type { UserConfig } from 'vitepress';
import { getSSRStyles } from '@veebox/vue';

// VitePress exposes the Vue SSR context in postRender, but not transformHead.
// Carry each page's CSS through its own output, never through a shared cache.
export const vboxSsgHooks: Pick<UserConfig, 'postRender' | 'transformHtml'> = {
  postRender(context) {
    const css = getSSRStyles(
      context as typeof context & Parameters<typeof getSSRStyles>[0],
    );
    if (css) {
      context.teleports ??= {};
      context.teleports.body = `${context.teleports.body ?? ''}<style id="vbox-ssr">${css}</style>`;
    }
    return context;
  },
  transformHtml(html) {
    const style = html.match(/<style id="vbox-ssr">[\s\S]*?<\/style>/)?.[0];
    return style
      ? html.replace(style, '').replace('</head>', `${style}</head>`)
      : html;
  },
};
