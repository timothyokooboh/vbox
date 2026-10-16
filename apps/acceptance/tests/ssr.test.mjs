import test from 'node:test';
import { createStyleCollector, keyframes } from '@veebox/core';
import assert from 'node:assert/strict';
import { createSSRApp, h, useSSRContext } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { VBoxPlugin, getSSRCollector, getSSRStyles, useVBoxStyleBinding } from '@veebox/vue';

test('plugin reset and theme CSS belongs to each SSR request even without a styling helper', async () => {
  assert.equal(typeof window, 'undefined');
  assert.equal(typeof CSS, 'undefined');
  const app = createSSRApp({ render: () => h('p', 'Server content') }).use(VBoxPlugin, {
    enableDefaultTheme: false,
    cssResets: true,
    theme: { color: { brand: { default: '#123456', dark: '#abcdef' } } },
  });
  const context = {};
  await renderToString(app, context);
  const css = getSSRStyles(context);
  assert.match(css, /box-sizing:border-box/);
  assert.match(css, /--color-brand:#123456/);
  assert.match(css, /--color-brand:#abcdef/);
  assert.ok(css.indexOf('box-sizing:border-box') < css.indexOf('--color-brand:'));
  getSSRCollector(context).reset();
  assert.equal(getSSRStyles(context), '');
  await renderToString(app, context);
  assert.equal(getSSRStyles(context), css);
});

test('keyframe identity includes nested values and keeps independent request CSS', () => {
  const first = createStyleCollector();
  const second = createStyleCollector();
  const full = Object.freeze({ from: Object.freeze({ opacity: 0 }), to: Object.freeze({ opacity: 1 }) });
  const partial = Object.freeze({ from: Object.freeze({ opacity: 0 }), to: Object.freeze({ opacity: 0.5 }) });
  const fullName = keyframes('fade', full, { collector: first });
  const partialName = keyframes('fade', partial, { collector: second });
  assert.notEqual(fullName, partialName);
  assert.match(first.getCss(), /opacity:1/);
  assert.doesNotMatch(first.getCss(), /opacity:0.5/);
  assert.match(second.getCss(), /opacity:0.5/);
});

test('keyframe output does not depend on browser validation availability', (t) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalCss = Object.getOwnPropertyDescriptor(globalThis, 'CSS');
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else delete globalThis.window;
    if (originalCss) Object.defineProperty(globalThis, 'CSS', originalCss);
    else delete globalThis.CSS;
  });
  const rules = { from: { translate: '3px', 'future-style': 'alpha' }, to: { translate: '7px' } };
  const server = createStyleCollector();
  const name = keyframes('validation', rules, { collector: server });
  globalThis.window = {};
  for (const cssApi of [undefined, { supports: () => false }]) {
    globalThis.CSS = cssApi;
    const client = createStyleCollector();
    assert.equal(keyframes('validation', rules, { collector: client }), name);
    assert.equal(client.getCss(), server.getCss());
    assert.match(client.getCss(), /future-style:alpha/);
  }
});

test('concurrent asynchronous SSR apps isolate alias, token, breakpoint and keyframe meanings', async () => {
  const render = async (alternate) => {
    const context = { event: { context: {} } };
    const app = createSSRApp({
      async setup() {
        const bind = useVBoxStyleBinding();
        const collector = getSSRCollector(useSSRContext());
        const animation = keyframes('request', { to: { opacity: alternate ? 0.3 : 0.7 } }, { collector });
        await Promise.resolve();
        return () => h('button', bind({ accent: '20px', color: 'cl-brand', animationName: animation, dark: { md: { hover: { color: 'cl-brand' } } } }), 'Concurrent');
      },
    }).use(VBoxPlugin, {
      enableDefaultTheme: false,
      aliases: { values: { accent: alternate ? 'height' : 'width' } },
      theme: { color: { brand: alternate ? 'blue' : 'red' } },
      breakpoints: { md: alternate ? '60rem' : '40em' },
    });
    const html = await renderToString(app, context);
    assert.equal(getSSRStyles(context.event.context), getSSRStyles(context));
    return { html, css: getSSRStyles(context) };
  };
  const results = await Promise.all(Array.from({ length: 12 }, (_, i) => render(i % 2 === 1)));
  for (const [index, result] of results.entries()) {
    const alternate = index % 2 === 1;
    assert.deepEqual(result, results[alternate ? 1 : 0]);
    assert.match(result.css, alternate ? /height:20px/ : /width:20px/);
    assert.match(result.css, alternate ? /--color-brand:blue/ : /--color-brand:red/);
    assert.match(result.css, alternate ? /60rem/ : /40em/);
    assert.doesNotMatch(result.css, alternate ? /opacity:0.7|--color-brand:red/ : /opacity:0.3|--color-brand:blue/);
  }
});
