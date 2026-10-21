import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { transformVueSfc } from '@veebox/unplugin';

const docs = path.resolve('../docs/docs');
for (const entry of await fs.readdir(docs, { recursive: true })) {
  if (!entry.endsWith('.md') || entry.startsWith('.vitepress')) continue;
  const source = await fs.readFile(path.join(docs, entry), 'utf8');
  for (const [index, fence] of [
    ...source.matchAll(/^```(?:vue|html)[^\n]*\n([\s\S]*?)^```/gm),
  ].entries()) {
    test(`docs snippet compiles: ${entry} #${index + 1}`, () => {
      const filename = path.join(docs, `${entry}-${index}.vue`);
      const snippet = fence[1];
      assert.doesNotMatch(
        snippet,
        /\s(?:sm|md|lg|xl|2xl):[\w-]+=/,
        'use :vb-sm="{ ... }", not colon utilities',
      );
      const sfc = /<template[\s>]/.test(snippet)
        ? snippet
        : `<template>${snippet}</template>`;
      const transformed = transformVueSfc(sfc, filename)?.code ?? sfc;
      const { descriptor, errors } = parse(transformed, { filename });
      assert.deepEqual(errors, []);
      const bindings =
        descriptor.script || descriptor.scriptSetup
          ? compileScript(descriptor, { id: filename }).bindings
          : undefined;
      const result = compileTemplate({
        filename,
        id: filename,
        source: descriptor.template.content,
        compilerOptions: {
          bindingMetadata: bindings,
          expressionPlugins: ['typescript'],
        },
      });
      assert.deepEqual(result.errors, []);
    });
  }
}
