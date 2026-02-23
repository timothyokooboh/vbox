import { render, screen } from '@testing-library/vue';
import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import { cleanup } from '@testing-library/vue';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import VBoxPlugin from '../src/plugins';
import { VBOX_SSR_COLLECTOR_KEY } from '../src/ssr';

describe('vbox runtime directive', () => {
  beforeEach(() => {
    if (!globalThis.CSS) {
      Object.defineProperty(globalThis, 'CSS', {
        value: {},
        configurable: true,
        writable: true,
      });
    }

    Object.defineProperty(globalThis.CSS, 'supports', {
      value: (declaration: string) => !declaration.includes('[object Object]'),
      configurable: true,
      writable: true,
    });

    const styleEl = document.getElementById('vbox-style-sheet');
    if (styleEl) {
      styleEl.remove();
    }
  });

  afterEach(() => {
    cleanup();
  });

  test('applies generated class on mount', () => {
    render(
      {
        template: `<p v-vbox-runtime="{ color: 'red', width: '240px' }">hello</p>`,
      },
      {
        global: {
          plugins: [VBoxPlugin],
        },
      },
    );

    const el = screen.getByText('hello');
    expect(el.className).toContain('css-');

    const styleEl = document.getElementById('vbox-style-sheet');
    expect(styleEl?.textContent).toContain('color:red');
    expect(styleEl?.textContent).toContain('width:240px');
  });

  test('merges with existing class names', () => {
    render(
      {
        template: `<p class="native" v-vbox-runtime="{ color: 'red' }">hello</p>`,
      },
      {
        global: {
          plugins: [VBoxPlugin],
        },
      },
    );

    const el = screen.getByText('hello');
    expect(el.classList.contains('native')).toBe(true);
    expect(el.className).toContain('css-');
  });

  test('replaces runtime class when styles change', async () => {
    const result = render(
      {
        props: {
          tone: {
            type: String,
            required: true,
          },
        },
        template: `<p v-vbox-runtime="{ color: tone }">hello</p>`,
      },
      {
        props: {
          tone: 'red',
        },
        global: {
          plugins: [VBoxPlugin],
        },
      },
    );

    const el = screen.getByText('hello');
    const firstClass = el.className;

    await result.rerender({ tone: 'blue' });

    const secondClass = el.className;
    expect(secondClass).not.toBe(firstClass);

    const styleEl = document.getElementById('vbox-style-sheet');
    expect(styleEl?.textContent).toContain('color:blue');
  });

  test('supports object style keys', () => {
    render(
      {
        template: `<p v-vbox-runtime="{ hover: { color: 'white' } }">hello</p>`,
      },
      {
        global: {
          plugins: [VBoxPlugin],
        },
      },
    );

    const styleEl = document.getElementById('vbox-style-sheet');
    expect(styleEl?.textContent).toContain(':hover');
    expect(styleEl?.textContent).toContain('color:white');
  });

  test('supports responsive object keys', () => {
    render(
      {
        template: `<p v-vbox-runtime="{ sm: { color: 'green' } }">hello</p>`,
      },
      {
        global: {
          plugins: [VBoxPlugin],
        },
      },
    );

    const styleEl = document.getElementById('vbox-style-sheet');
    expect(styleEl?.textContent).toContain('@media');
    expect(styleEl?.textContent).toContain('min-width: 40rem');
    expect(styleEl?.textContent).toContain('color:green');
  });

  test('collects css during SSR', async () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    // @ts-expect-error simulate ssr
    delete globalThis.window;
    // @ts-expect-error simulate ssr
    delete globalThis.document;

    const app = createSSRApp({
      template: `<p v-vbox-runtime="{ color: 'red' }">hello</p>`,
    });
    app.use(VBoxPlugin);

    const ctx: Record<string, unknown> = {};
    const html = await renderToString(app, ctx);

    const collector = ctx[VBOX_SSR_COLLECTOR_KEY] as { getCss: () => string };
    expect(collector).toBeDefined();
    const css = collector.getCss();

    expect(html).toContain('class="css-');
    expect(css).toContain('color:red');

    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });
});
