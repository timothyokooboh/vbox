import { render, screen } from '@testing-library/vue';
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup } from '@testing-library/vue';
import { createApp, createSSRApp, h, withDirectives, ref, nextTick } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { VBoxPlugin, vboxRuntimeDirective } from '../src';
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

  test('isolates nested directive values and declaration order across consumers and updates', async () => {
    const result = render(
      {
        props: ['tone'],
        template: `
        <button v-vbox-runtime="{ hover: { color: tone } }">Nested changing</button>
        <button v-vbox-runtime="{ hover: { color: 'blue' } }">Nested stable</button>
        <button v-vbox-runtime="{ padding: '8px', paddingLeft: '16px' }">Longhand last</button>
        <button v-vbox-runtime="{ paddingLeft: '16px', padding: '8px' }">Shorthand last</button>
      `,
      },
      { props: { tone: 'red' }, global: { plugins: [VBoxPlugin] } },
    );
    const changing = screen.getByText('Nested changing');
    const stable = screen.getByText('Nested stable');
    const original = changing.className;
    expect(original).not.toBe(stable.className);
    expect(screen.getByText('Longhand last').className).not.toBe(
      screen.getByText('Shorthand last').className,
    );
    await result.rerender({ tone: 'green' });
    expect(changing.className).not.toBe(original);
    expect(changing.className).not.toBe(stable.className);
  });

  test('isolates same-prefix apps with different effective aliases and breakpoints', () => {
    const configs = [
      {
        aliases: { values: { accent: 'width' as const } },
        breakpoints: { sm: '400px' },
      },
      {
        aliases: { values: { accent: 'height' as const } },
        breakpoints: { sm: '400px' },
      },
      {
        aliases: { values: { accent: 'width' as const } },
        breakpoints: { sm: '1200px' },
      },
    ];
    const apps = configs.map((config) =>
      createApp({
        template: `<button v-vbox-runtime="{ accent: '23px', sm: { color: 'purple' } }">Configured</button>`,
      }).use(VBoxPlugin, {
        ...config,
        classNamePrefix: 'directive-quality',
        enableDefaultTheme: false,
      }),
    );
    const hosts = apps.map(() =>
      document.body.appendChild(document.createElement('div')),
    );
    try {
      apps.forEach((app, index) => app.mount(hosts[index]));
      const buttons = hosts.map((host) => host.querySelector('button')!);
      expect(new Set(buttons.map((button) => button.className)).size).toBe(3);
      expect(getComputedStyle(buttons[0]).width).toBe('23px');
      expect(getComputedStyle(buttons[1]).height).toBe('23px');
    } finally {
      apps.forEach((app) => app.unmount());
      hosts.forEach((host) => host.remove());
    }
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

  test('keeps multiple runtime classes when parent and child both use vbox-runtime', () => {
    render(
      {
        components: {
          AppButton: {
            template: `<button v-vbox-runtime="{ bg: 'cl-brand', color: 'white' }">View Details</button>`,
          },
        },
        template: `<AppButton v-vbox-runtime="{ color: 'yellow' }" />`,
      },
      {
        global: {
          plugins: [VBoxPlugin],
        },
      },
    );

    const el = screen.getByText('View Details');
    const runtimeClasses = [...el.classList].filter((cls) =>
      cls.startsWith('css-'),
    );
    expect(runtimeClasses.length).toBe(2);

    const styleEl = document.getElementById('vbox-style-sheet');
    expect(styleEl?.textContent).toContain('color:yellow');
    expect(styleEl?.textContent).toContain('background:var(--color-brand)');
  });

  test('withdraws, changes and reapplies a shared directive class without removing another owner', async () => {
    const result = render(
      {
        props: ['contribution'],
        components: {
          SharedAction: {
            template: `<button class="authored-child" v-vbox-runtime="{ color: 'red' }">Shared quality action</button>`,
          },
        },
        template: `<SharedAction class="authored-caller" v-vbox-runtime:override="contribution" />`,
      },
      {
        props: { contribution: { color: 'red' } },
        global: { plugins: [VBoxPlugin] },
      },
    );
    const action = screen.getByText('Shared quality action');
    const expectColor = (color: string) => {
      expect(getComputedStyle(action).color).toBe(color);
      expect(action.classList.contains('authored-child')).toBe(true);
      expect(action.classList.contains('authored-caller')).toBe(true);
    };
    expectColor('rgb(255, 0, 0)');
    await result.rerender({ contribution: null });
    expectColor('rgb(255, 0, 0)');
    await result.rerender({ contribution: { color: 'blue' } });
    expectColor('rgb(0, 0, 255)');
    await result.rerender({ contribution: { color: 'red' } });
    expectColor('rgb(255, 0, 0)');
    await result.rerender({ contribution: { color: 'blue' } });
    expectColor('rgb(0, 0, 255)');
    await result.rerender({ contribution: undefined });
    expectColor('rgb(255, 0, 0)');
  });

  test('keeps parent override lane after internal lane across updates', async () => {
    const result = render(
      {
        props: {
          tone: {
            type: String,
            required: true,
          },
        },
        components: {
          AppButton: {
            props: {
              tone: {
                type: String,
                required: true,
              },
            },
            template: `<button v-vbox-runtime="{ bg: 'papayawhip', color: tone }">View Details</button>`,
          },
        },
        template: `<AppButton :tone="tone" v-vbox-runtime:override="{ color: 'mediumspringgreen' }" />`,
      },
      {
        props: {
          tone: 'salmon',
        },
        global: {
          plugins: [VBoxPlugin],
        },
      },
    );

    const el = screen.getByText('View Details');
    const runtimeClasses = [...el.classList].filter((cls) =>
      cls.startsWith('css-'),
    );
    expect(runtimeClasses.length).toBe(2);

    const styleEl = document.getElementById(
      'vbox-style-sheet',
    ) as HTMLStyleElement;
    const cssBefore = styleEl.textContent || '';
    expect(cssBefore.indexOf('color:mediumspringgreen')).toBeGreaterThan(
      cssBefore.indexOf('background:papayawhip;color:salmon'),
    );

    await result.rerender({ tone: 'tomato' });

    const cssAfter =
      (document.getElementById('vbox-style-sheet') as HTMLStyleElement)
        .textContent || '';
    expect(cssAfter.indexOf('color:mediumspringgreen')).toBeGreaterThan(
      cssAfter.indexOf('background:papayawhip;color:tomato'),
    );
  });

  test('hydrates render-function directive owners before mount', async () => {
    const contribution = ref<Record<string, string> | null>({ color: 'red' });
    let beforeMountColor = '';
    const Child = {
      setup: () => () =>
        withDirectives(
          h(
            'button',
            {
              class: 'hydrated-child',
              onVnodeBeforeMount: (vnode: { el: Element }) => {
                beforeMountColor = getComputedStyle(vnode.el).color;
              },
            },
            'Hydrated directive',
          ),
          [[vboxRuntimeDirective, { color: 'red' }]],
        ),
    };
    const Root = {
      setup: () => () =>
        withDirectives(
          h(Child, {
            class: 'hydrated-caller',
          }),
          [[vboxRuntimeDirective, contribution.value, 'override']],
        ),
    };
    const makeApp = () =>
      createSSRApp(Root).use(VBoxPlugin, { enableDefaultTheme: false });
    const host = document.body.appendChild(document.createElement('div'));
    const app = makeApp();
    const warnings: string[] = [];
    app.config.warnHandler = (message) => warnings.push(message);
    const errors = vi.spyOn(console, 'error');
    try {
      host.innerHTML = await renderToString(makeApp(), {});
      const original = host.querySelector('button')!;
      app.mount(host);
      await nextTick();
      expect(host.querySelector('button')).toBe(original);
      expect(warnings).toEqual([]);
      expect(beforeMountColor).toBe('rgb(255, 0, 0)');
      expect(errors.mock.calls.flat().join(' ')).not.toMatch(/hydration/i);
      contribution.value = null;
      await nextTick();
      expect(getComputedStyle(original).color).toBe('rgb(255, 0, 0)');
      expect(original.classList.contains('hydrated-child')).toBe(true);
      expect(original.classList.contains('hydrated-caller')).toBe(true);
    } finally {
      app.unmount();
      host.remove();
      errors.mockRestore();
    }
  });

  test('still reports real hydration text mismatches on a directive target', async () => {
    const text = ref('Server text');
    const Root = {
      setup: () => () =>
        withDirectives(
          h('button', { class: 'diagnostic-target' }, text.value),
          [[vboxRuntimeDirective, { color: 'red' }]],
        ),
    };
    const makeApp = () =>
      createSSRApp(Root).use(VBoxPlugin, { enableDefaultTheme: false });
    const host = document.body.appendChild(document.createElement('div'));
    const app = makeApp();
    const warnings: string[] = [];
    app.config.warnHandler = (message) => warnings.push(message);
    try {
      host.innerHTML = await renderToString(makeApp(), {});
      text.value = 'Client text';
      app.mount(host);
      await nextTick();
      expect(warnings.join(' ')).toMatch(/Hydration text content mismatch/);
      expect(host.textContent).toBe('Client text');
    } finally {
      app.unmount();
      host.remove();
    }
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
