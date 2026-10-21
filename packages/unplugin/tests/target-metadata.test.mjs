import test from 'node:test';
import assert from 'node:assert/strict';
import { transformVueSfc } from '@veebox/unplugin/transform';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

test('custom component names resembling head tags remain valid explicit styling targets', () => {
  for (const tag of ['Meta', 'Link', 'Title']) {
    const result = transformVueSfc(
      `<template><${tag} vb-color="red" /></template>`,
      'Target.vue',
    );
    assert.ok(result);
    const { descriptor } = parse(result.code);
    const script = compileScript(descriptor, { id: 'target' });
    const template = compileTemplate({
      id: 'target',
      filename: 'Target.vue',
      source: descriptor.template.content,
      compilerOptions: { bindingMetadata: script.bindings },
    });
    assert.deepEqual(template.errors, []);
    assert.deepEqual(result.warnings, []);
  }
  for (const tag of ['meta', 'link', 'title'])
    assert.throws(
      () =>
        transformVueSfc(
          `<template><${tag} vb-color="red" /></template>`,
          'Target.vue',
        ),
      /needs a rendered element/,
    );
});
