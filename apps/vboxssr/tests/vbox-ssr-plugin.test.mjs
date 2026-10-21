import test from 'node:test';
import assert from 'node:assert/strict';
import { VBOX_SSR_COLLECTOR_KEY } from '@veebox/vue';
import { getVboxSsrCss } from '../server/utils/vbox-ssr-shared.mjs';

test('returns css when collector exists on context', () => {
  const css = getVboxSsrCss({
    [VBOX_SSR_COLLECTOR_KEY]: {
      getCss: () => '.vbox{color:red;}',
    },
  });

  assert.equal(css, '.vbox{color:red;}');
});

test('returns empty string when collector is missing', () => {
  assert.equal(getVboxSsrCss({}), '');
  assert.equal(getVboxSsrCss(undefined), '');
});
