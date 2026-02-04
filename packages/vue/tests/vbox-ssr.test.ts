import { describe, expect, test } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import VBox from '../src/components/VBox.vue';
import { VBOX_SSR_COLLECTOR_KEY } from '../src/ssr';

describe('VBox SSR', () => {
  test('collects styles into SSR context', async () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    // @ts-expect-error remove window/document to simulate SSR
    delete globalThis.window;
    // @ts-expect-error remove window/document to simulate SSR
    delete globalThis.document;

    const context: Record<string, unknown> = {};
    const app = createSSRApp({
      render: () => h(VBox, { color: 'red' }),
    });

    const html = await renderToString(app, context);
    const collector = context[VBOX_SSR_COLLECTOR_KEY] as {
      getCss: () => string;
    };

    expect(collector).toBeDefined();

    const css = collector.getCss();
    const classMatch = html.match(/class="([^"]+)"/);
    expect(classMatch).toBeTruthy();
    if (classMatch) {
      expect(css).toContain(`.${classMatch[1]}`);
    }
    expect(css).toContain('color:red');

    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });
});
