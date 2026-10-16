import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSSRApp,
  defineComponent,
  h,
  Fragment,
  createCommentVNode,
  createTextVNode,
} from 'vue';
import { renderToString } from '@vue/server-renderer';
import {
  VBox,
  VBoxPlugin,
  getSSRStyles,
  useVBoxStyleBinding,
} from '@veebox/vue';

const render = async (props, children) => {
  const context = {};
  const warnings = [];
  const app = createSSRApp({
    render: () => h(VBox, props, children ? { default: children } : undefined),
  }).use(VBoxPlugin);
  app.config.warnHandler = (message) => warnings.push(message);
  const html = await renderToString(app, context);
  return { html, css: getSSRStyles(context), warnings };
};

test('published styling and underscore conditions work without a template compiler or browser CSS', async () => {
  const result = await render(
    {
      is: 'button',
      color: 'red',
      _disabled: { color: 'blue' },
      _2xl: { padding: '10px' },
      disabled: true,
      title: 'Semantic title',
      style: { fontStyle: 'italic' },
    },
    () => 'Save',
  );
  assert.match(result.html, /^<button/);
  assert.match(result.html, /disabled/);
  assert.match(result.html, /title="Semantic title"/);
  assert.match(result.css, /color:red/);
  assert.match(result.css, /:disabled/);
  assert.match(result.css, /color:blue/);
  assert.match(result.css, /min-width:\s*96rem/);
  assert.doesNotMatch(result.css, /Semantic title|font-style|disabled:true/);
  assert.deepEqual(result.warnings, []);
});

test('asChild unwraps one fragment child and ignores comments and whitespace without slot tracking warnings', async () => {
  const result = await render(
    { asChild: true, color: 'purple', class: 'caller', 'data-owner': 'kept' },
    () => [
      createCommentVNode('comment'),
      h(Fragment, null, [
        createTextVNode(' '),
        h('button', { class: 'child' }, 'Save'),
      ]),
    ],
  );
  assert.match(result.html, /^<button/);
  assert.match(result.html, /data-owner="kept"/);
  assert.match(result.html, /class="[^"]*child[^"]*caller/);
  assert.match(result.css, /color:purple/);
  assert.deepEqual(result.warnings, []);
});

test('asChild rejects every ambiguous or non-element target, including raw fragment text, without choosing a root', async (t) => {
  const messages = [];
  t.mock.method(console, 'warn', (message) => messages.push(message));
  const cases = [
    () => [],
    () => [h('button', null, 'One'), h('button', null, 'Two')],
    () => [createTextVNode('Text')],
    () => [h(Fragment, null, ['Nonempty text', h('button', null, 'Hidden')])],
  ];
  for (const children of cases) {
    messages.length = 0;
    const result = await render({ asChild: true, color: 'purple' }, children);
    assert.doesNotMatch(result.html, /<button/);
    assert.ok(
      messages.some((message) =>
        /asChild expects exactly one root/.test(message),
      ),
    );
  }
});

test('a fragment without explicit forwarding retains Vue diagnostics instead of inventing a style target', async () => {
  const warnings = [];
  const FragmentButton = defineComponent({
    setup: () => () =>
      h(Fragment, null, [
        h('span', null, 'Label'),
        h('button', null, 'Action'),
      ]),
  });
  const app = createSSRApp({
    setup() {
      const bind = useVBoxStyleBinding();
      return () =>
        h(FragmentButton, bind({ color: 'yellow' }, { class: 'caller' }));
    },
  }).use(VBoxPlugin);
  app.config.warnHandler = (message) => warnings.push(message);
  const html = await renderToString(app, {});
  assert.doesNotMatch(html, /class=/);
  assert.ok(
    warnings.some((message) =>
      /Extraneous non-props attributes.*fragment/.test(message),
    ),
  );
});
