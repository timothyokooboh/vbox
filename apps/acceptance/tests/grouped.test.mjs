import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { VBoxPlugin, useVBoxStyleBinding, getSSRStyles } from '@veebox/vue';

async function render(grouped, direct = {}) {
  const app = createSSRApp({
    setup() {
      const bind = useVBoxStyleBinding();
      return () =>
        h('button', bind(direct, { translate: 'no' }, grouped), 'Styled');
    },
  }).use(VBoxPlugin, { enableDefaultTheme: false });
  const warnings = [];
  app.config.warnHandler = (message) => warnings.push(message);
  const context = {};
  const html = await renderToString(app, context);
  assert.deepEqual(warnings, []);
  return { html, css: getSSRStyles(context) };
}

test('invalid grouped source and property shapes have actionable diagnostics', async () => {
  for (const value of [
    123,
    false,
    'color: red',
    [],
    new Date(),
    { color: {} },
    { hover: 'red' },
    { 'vb-color': 'red' },
  ]) {
    await assert.rejects(
      render(value),
      /\[VBox\].*(object|scalar|unprefixed)/i,
    );
  }
});

test('frozen style objects stay untouched and absence does not override a remaining source', async () => {
  const styles = Object.freeze({
    color: 'red',
    opacity: 0,
    hover: Object.freeze({ color: 'blue' }),
  });
  const before = JSON.stringify(styles);
  const out = await render(styles, { color: undefined, opacity: null });
  assert.match(out.css, /color:red/);
  assert.match(out.css, /opacity:0/);
  assert.match(out.css, /:hover.*color:blue/);
  assert.doesNotMatch(out.css, /\[object Object\]/);
  assert.equal(JSON.stringify(styles), before);
  assert.match(out.html, /translate="no"/);
  assert.doesNotMatch(out.html, / vb=/);
  const reset = await render({ color: 'initial' });
  assert.match(reset.css, /color:initial/);
});

test('circular conditional objects fail with an actionable source location', async () => {
  const styles = {};
  styles.hover = styles;
  await assert.rejects(render(styles), /Circular style object at :vb.hover/);
});

test('selector leaves cannot stringify objects, including custom properties', async () => {
  for (const key of ['content', '--probe']) {
    await assert.rejects(
      render({ declarations: { '&::before': { [key]: { text: 'hello' } } } }),
      /\[VBox\].*:vb\.declarations\.&::before.*scalar/i,
    );
  }
});

test('selector names are not template prefixes and clean conditions retain their rules', async () => {
  const { css } = await render({
    declarations: { 'vb-card': { color: 'red' } },
    disabled: { color: 'blue' },
    '2xl': { opacity: 0.5 },
  });
  assert.match(css, /vb-card\s*\{[^}]*color:red/);
  assert.match(css, /:disabled\s*\{[^}]*color:blue/);
  assert.match(css, /@media.*96rem.*opacity:0.5/);
});

test('query and pseudo entries retain their existing nested-selector shape', async () => {
  const { css } = await render({
    pseudos: { ':hover': { 'vb-card': { color: 'purple' } } },
    mq: { '@media (min-width: 1px)': { 'vb-card': { color: 'green' } } },
  });
  assert.match(css, /vb-card\s*\{[^}]*color:purple/);
  assert.match(css, /vb-card\s*\{[^}]*color:green/);
});
