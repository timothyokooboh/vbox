import test from 'node:test';
import assert from 'node:assert/strict';
import { transformVueSfc } from '../dist/transform.js';

const id = '/project with spaces/Example.vue';

test('duplicate normalized style bindings identify the authored duplicate location', () => {
  const source =
    '<template>\n  <p vb-color="red"\n     vbColor="blue" />\n</template>';
  assert.throws(
    () => transformVueSfc(source, id),
    (error) => {
      assert.match(error.message, /Duplicate style binding/);
      assert.ok(error.message.includes(`${id}:3:6`));
      assert.deepEqual(error.loc, { file: id, line: 3, column: 5 });
      return true;
    },
  );
});

for (const [markup, message] of [
  ['<p :vb-color.prop="color" />', /modifier/],
  ['<slot vb-color="red" />', /rendered element/],
  ['<p vb-hover="{}" />', /object binding/],
  ['<p vb-="red" />', /property name/],
  ['<p :vb-color="" />', /expression/],
  ['<p :vb-color="color +" />', /expression|Unexpected token/],
]) {
  test(`invalid explicit binding has an original-source location: ${markup}`, () => {
    assert.throws(
      () => transformVueSfc(`<template>\n  ${markup}\n</template>`, id),
      (error) => {
        assert.match(error.message, message);
        assert.equal(error.loc?.file, id);
        assert.equal(error.loc?.line, 2);
        assert.ok(error.loc.column >= 2);
        return true;
      },
    );
  });
}

test('unsupported template preprocessors are rejected before treating their source as HTML', () => {
  assert.throws(
    () =>
      transformVueSfc(
        '<template lang="pug">\np(vb-color="red") Hello\n</template>',
        id,
      ),
    (error) => {
      assert.match(error.message, /HTML.*pug|pug.*HTML/);
      assert.equal(error.loc.file, id);
      return true;
    },
  );
});
