import { transformExplicitStyles } from './explicit.js';
import * as knownCssProperties from 'known-css-properties';
import {
  createStyleVocabulary,
  DefaultAliases,
  validateAliasKeys,
} from '@veebox/core';
import { loadVBoxConfig } from '@veebox/core/config';
import type {
  VBoxNativePluginOptions,
  VBoxSfcTransformResult,
} from './types.js';

/** Ordinary Vue bindings never enter styling classification. */
export const transformVueSfc = (
  code: string,
  id: string,
  options: VBoxNativePluginOptions = {},
): VBoxSfcTransformResult => {
  if (id.includes('?') || id.includes('\0')) return null;
  if (!id.endsWith('.vue') || /[\\/]+node_modules[\\/]+/.test(id)) return null;

  for (const key of [
    'parseAllComponents',
    'forceStyleAttrs',
    'forceSemanticAttrs',
  ]) {
    if (Object.prototype.hasOwnProperty.call(options, key))
      throw new Error(
        `[VBox] ${key} was removed. Use explicit vb-* bindings or :vb for styling; ordinary Vue bindings stay semantic.`,
      );
  }

  const loaded = loadVBoxConfig(options, id);
  const aliases =
    options.aliases ?? Object.keys(loaded.config.aliases?.values ?? {});
  validateAliasKeys(aliases, loaded.file ?? 'compiler aliases');
  const vocabulary = createStyleVocabulary(knownCssProperties.all, [
    ...(loaded.config.aliases?.strategy === 'replace'
      ? []
      : Object.keys(DefaultAliases)),
    ...aliases,
  ]);
  const result = transformExplicitStyles(code, id, vocabulary);
  return result
    ? { ...result, dependencies: loaded.file ? [loaded.file] : [] }
    : null;
};
