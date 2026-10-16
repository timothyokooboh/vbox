import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { VBoxPlugin, useVBoxStyleBinding, getSSRStyles } from '@veebox/vue';
import {
  getCss,
  createStyleCollector,
  composeStyleSources,
  renderStyleRules,
  DefaultAliases,
  DefaultBreakpoints,
} from '@veebox/core';

const bundle = (key, ownerDepth, styles) => ({
  key,
  ownerDepth,
  rules: renderStyleRules(
    composeStyleSources(styles, {}, DefaultAliases),
    key,
    DefaultBreakpoints,
  ),
});

test('request collectors sort context before owner independently of collection order and cache hits', () => {
  const internal = bundle('internal', 2, {
    color: 'white',
    hover: { color: 'red' },
  });
  const caller = bundle('caller', 1, {
    color: 'yellow',
    hover: { color: 'blue' },
  });
  const first = createStyleCollector();
  const second = createStyleCollector();
  first.collectStyleBundle(caller);
  first.collectStyleBundle(internal);
  second.collectStyleBundle(internal);
  second.collectStyleBundle(caller);
  second.collectStyleBundle(internal);
  assert.equal(first.getCss(), second.getCss());
  assert.match(
    first.getCss(),
    /color:white.*color:yellow.*color:red.*color:blue/s,
  );
  first.reset();
  assert.equal(first.getCss(), '');
  assert.notEqual(second.getCss(), '');
});

test('collecting structured rules copies metadata and preserves existing raw CSS collection', () => {
  const collector = createStyleCollector();
  const rules = bundle('frozen', 1, { padding: '8px', paddingLeft: '20px' });
  rules.rules.forEach((rule) => {
    Object.freeze(rule.context);
    Object.freeze(rule);
  });
  Object.freeze(rules.rules);
  Object.freeze(rules);
  collector.collect('.theme { --color-brand: red; }');
  collector.collectStyleBundle(rules);
  const before = collector.getCss();
  collector.collectStyleBundle(rules);
  assert.equal(collector.getCss(), before);
  assert.match(before, /--color-brand:red.*padding:8px;padding-left:20px/s);
});

test('SSR preserves authored owner classes and repeatable request output', async () => {
  const Child = defineComponent({
    setup() {
      const bind = useVBoxStyleBinding();
      return () =>
        h(
          'button',
          bind({ color: 'red' }, { class: 'internal-user' }),
          'Owned',
        );
    },
  });
  const Root = defineComponent({
    setup() {
      const bind = useVBoxStyleBinding();
      return () => h(Child, bind({ color: 'red' }, { class: 'caller-user' }));
    },
  });
  const render = async () => {
    const context = {};
    const app = createSSRApp(Root).use(VBoxPlugin, {
      enableDefaultTheme: false,
    });
    const html = await renderToString(app, context);
    return { html, css: getSSRStyles(context) };
  };
  const first = await render();
  const classes = first.html.match(/class="([^"]+)"/)[1].split(/\s+/);
  assert.ok(classes.includes('internal-user'));
  assert.ok(classes.includes('caller-user'));
  assert.deepEqual(await render(), first);
});

test('existing raw registry shapes remain readable through the public getCss API', () => {
  assert.equal(
    getCss({ base: new Set(['.a{color:red}']), override: new Set() }),
    '.a{color:red}',
  );
});
