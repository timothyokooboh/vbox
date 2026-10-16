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

test('nonparticipating preprocessed templates pass through unchanged', () => {
  const source = '<template lang="pug">\np Hello\n</template>';
  const result = transformVueSfc(source, id);
  assert.equal(result?.code ?? source, source);
  assert.equal(result?.warnings?.length ?? 0, 0);
});

test('explicit styling in an unsupported preprocessor produces located guidance without rewriting it', () => {
  const source = '<template lang="pug">\np(vb-color="red") Hello\n</template>';
  const result = transformVueSfc(source, id);
  assert.equal(result.code, source);
  assert.match(result.warnings[0].message, /HTML.*pug|pug.*HTML/);
  assert.ok(result.warnings[0].message.includes(id));
  assert.ok(result.warnings[0].loc.line >= 1);
});

for (const [clean, compatibility] of [
  ['hover', '_hover'],
  ['2xl', '_2xl'],
  ['focus-visible', '_focusVisible'],
]) {
  test(`duplicate ${clean} condition spellings identify the second binding`, () => {
    const source = `<template>\n<p :vb-${clean}="{color:'red'}"\n   :vb-${compatibility}="{opacity:0.5}" />\n</template>`;
    assert.throws(
      () => transformVueSfc(source, id),
      (error) => {
        assert.match(error.message, /Duplicate style binding/);
        assert.deepEqual(error.loc, { file: id, line: 3, column: 3 });
        return true;
      },
    );
  });
}
