#!/usr/bin/env node
/*
  Generates vbox.d.ts with type augmentations for alias and design tokens
*/

import path from 'node:path';
import fs from 'fs-extra';
import { createJiti } from 'jiti';
import { DefaultTheme, ThemeCategories } from '../constants.js';
import { deepMerge } from '../helpers/mergeTheme.js';
import type { VBoxPluginOptions, Theme, ThemeKeys } from '../types.js';
import { parseReferencePath } from '../helpers/themeConfigParser.js';

const jiti = createJiti(import.meta.url, { debug: true });
const root = process.cwd();
const configs = [
  path.resolve(root, 'vbox.config.ts'),
  path.resolve(root, 'vbox.config.js'),
  path.resolve(root, 'vbox.config.cjs'),
  path.resolve(root, 'vbox.config.mjs'),
];

const loadConfig = async () => {
  for (const config of configs) {
    if (await fs.pathExists(config)) {
      try {
        const modDefault = (await jiti.import(config, {
          default: true,
        })) as VBoxPluginOptions;
        return modDefault;
      } catch (err) {
        console.error('Failed to load config:', config, err);
      }
    }
  }
  return null;
};

// type ThemeShape = VBoxPluginOptions['theme'];

const isReference = (v: unknown): v is string =>
  typeof v === 'string' && v.startsWith('$');

function getBucket(theme: Theme, category: ThemeKeys) {
  if (!ThemeCategories.includes(category)) return undefined;

  const bucket = theme[category];
  return typeof bucket === 'object' && bucket ? bucket : undefined;
}

// Resolve token for non-color categories -> returns a string (primitive) or raw ref fallback
function resolvePrimitiveToken(
  theme: Theme,
  category: ThemeKeys,
  key: string,
  stack: string[] = [],
): string {
  const bucket = getBucket(theme, category);
  if (!bucket) {
    console.warn(`[vbox-type-gen] Unknown category: ${category}`);
    return `$${category}.${key}`;
  }

  const id = `${category}.${key}`;
  if (stack.includes(id)) {
    console.warn(
      `[vbox-type-gen] Circular reference detected: ${[...stack, id].join(' -> ')}`,
    );
    return `$${category}.${key}`;
  }

  const val = bucket[key];
  if (val === undefined) {
    console.warn(
      `[vbox-type-gen] Unknown token reference: $${category}.${key}`,
    );
    return `$${category}.${key}`;
  }

  if (typeof val === 'string' && isReference(val)) {
    const path = parseReferencePath(val);
    const [category, key] = path as [ThemeKeys, string];

    return resolvePrimitiveToken(theme, category, key, [...stack, id]);
  }

  if (typeof val === 'string') return val;

  // fallback for unexpected object
  if (typeof val === 'object' && val !== null) {
    if (typeof val.default === 'string') return val.default;
    const first = Object.values(val).find((v) => typeof v === 'string');
    return (first as string) ?? `$${category}.${key}`;
  }

  return `$${category}.${key}`;
}

// Resolve color token -> returns array of string values (modes) or resolved strings
function resolveColorTokenValues(
  theme: Theme,
  key: string,
  stack: string[] = [],
): string[] {
  const bucket = theme?.color ?? {};
  const id = `color.${key}`;

  if (stack.includes(id)) {
    console.warn(
      `[vbox-type-gen] Circular color reference: ${[...stack, id].join(' -> ')}`,
    );
    return [`$color.${key}`];
  }

  const val = bucket[key];
  if (val === undefined) {
    console.warn(`[vbox-type-gen] Unknown color token: ${key}`);
    return [`$color.${key}`];
  }

  if (typeof val === 'string' && !isReference(val)) {
    return [val];
  }

  if (typeof val === 'string' && isReference(val)) {
    const cleaned = val.replace(/^\$/, '');
    const [catRaw, ...rest] = cleaned.split('.');
    const cat = catRaw; // must match exactly 'color'
    const refKey = rest.join('.');

    if (cat !== 'color') {
      console.warn(
        `[vbox-type-gen] Invalid reference category '${cat}' in color token '${key}'.`,
      );
      return [`$color.${key}`];
    }

    return resolveColorTokenValues(theme, refKey, [...stack, id]);
  }

  if (typeof val === 'object' && val !== null) {
    return Object.values(val).filter((v) => typeof v === 'string') as string[];
  }

  return [`$color.${key}`];
}

// Build interface entries for a category
function buildThemeInterfaceBlock(
  values: Record<string, unknown>,
  typeName: string,
  theme?: Theme,
) {
  const lines: string[] = [];

  for (const [k, rawVal] of Object.entries(values)) {
    // Colors -> possibly union of mode values
    if (typeName === 'ColorTokensInterface') {
      // resolve possibly referenced values to an array of string values
      const resolved = resolveColorTokenValues(theme ?? {}, k);
      // create JSDoc listing modes and values; if original rawVal is object with keys, include mode names
      let jsdoc = '';
      if (typeof rawVal === 'object' && rawVal !== null) {
        const modeLines = Object.entries(rawVal)
          .filter(([, v]) => typeof v === 'string')
          .map(([mode, v]) => `${mode}: ${v}`)
          .join('\n * ');
        jsdoc = `/**\n * ${modeLines}\n */\n`;
      } else if (typeof rawVal === 'string' && isReference(rawVal)) {
        const resolvedLines = resolved.join(' | ');
        jsdoc = `/**\n * ${resolvedLines}\n */\n`;
      } else if (typeof rawVal === 'string') {
        jsdoc = `/**\n * ${rawVal}\n */\n`;
      }

      const uniq = Array.from(new Set(resolved));
      const union = uniq.map((s) => JSON.stringify(s)).join(' | ') || 'string';
      lines.push(`${jsdoc}  ${JSON.stringify(k)}: ${union};`);
    } else {
      // Non-color categories: resolve references to single primitive string
      let finalValue: string;
      if (typeof rawVal === 'string' && isReference(rawVal)) {
        const path = parseReferencePath(rawVal);
        const [category, key] = path as [ThemeKeys, string];
        finalValue = resolvePrimitiveToken(theme ?? {}, category, key);
      } else if (typeof rawVal === 'object' && rawVal !== null) {
        // it's unexpected for non-color, but try to pick default or first string
        finalValue =
          (rawVal as { default: string }).default ??
          Object.values(rawVal).find((v) => typeof v === 'string') ??
          String(rawVal);
      } else {
        finalValue = String(rawVal);
      }

      const jsdoc = `/**\n * ${finalValue}\n */\n`;
      lines.push(
        `${jsdoc}  ${JSON.stringify(k)}: ${JSON.stringify(finalValue)};`,
      );
    }
  }

  if (lines.length === 0) return '';

  return `interface ${typeName} {\n${lines.join('\n')}\n}\n`;
}

const buildAliasDts = (aliases = {}) => {
  if (Object.keys(aliases).length === 0) return '';

  const entries = Object.entries(aliases)
    .map(([k, v]) => `    ${k}: "${v}";`)
    .join('\n');
  return `
interface AliasMap {
${entries || '    // no user aliases'}
}
`;
};

const main = async () => {
  const config = await loadConfig();

  if (!config) {
    console.log(
      'Could not find either vbox.config.ts or vbox.config.js file at the root of the project',
    );
  }

  const enableDefaultTheme = config?.enableDefaultTheme !== false;
  const base = enableDefaultTheme ? DefaultTheme : {};
  const mergedTheme = deepMerge(base, config?.theme ?? {});

  const aliases = config?.aliases?.values ?? config?.aliases?.values ?? {};
  const color = mergedTheme?.color ?? {};
  const fontSizes = mergedTheme?.fontSize ?? {};
  const fontWeights = mergedTheme?.fontWeight ?? {};
  const fontFamilies = mergedTheme?.fontFamily ?? {};
  const lineHeights = mergedTheme?.lineHeight ?? {};
  const letterSpacings = mergedTheme?.letterSpacing ?? {};
  const spacings = mergedTheme?.spacing ?? {};
  const borderRadius = mergedTheme?.borderRadius ?? {};
  const boxShadow = mergedTheme?.boxShadow ?? {};
  const zIndex = mergedTheme?.zIndex ?? {};

  const outFile = path.resolve(root, 'vbox.d.ts');

  const aliasDts = buildAliasDts(aliases);
  const colorBlock = buildThemeInterfaceBlock(
    color,
    'ColorTokensInterface',
    mergedTheme,
  );
  const fontSizeBlock = buildThemeInterfaceBlock(
    fontSizes,
    'FontSizeTokensInterface',
    mergedTheme,
  );
  const fontWeightBlock = buildThemeInterfaceBlock(
    fontWeights,
    'FontWeightTokensInterface',
    mergedTheme,
  );
  const fontFamilyBlock = buildThemeInterfaceBlock(
    fontFamilies,
    'FontFamilyTokensInterface',
    mergedTheme,
  );
  const lineHeightBlock = buildThemeInterfaceBlock(
    lineHeights,
    'LineHeightTokensInterface',
    mergedTheme,
  );
  const letterSpacingBlock = buildThemeInterfaceBlock(
    letterSpacings,
    'LetterSpacingTokensInterface',
    mergedTheme,
  );
  const spacingBlock = buildThemeInterfaceBlock(
    spacings,
    'SpacingTokensInterface',
    mergedTheme,
  );
  const borderRadiusBlock = buildThemeInterfaceBlock(
    borderRadius,
    'BorderRadiusTokensInterface',
    mergedTheme,
  );
  const boxShadowBlock = buildThemeInterfaceBlock(
    boxShadow,
    'BoxShadowTokensInterface',
    mergedTheme,
  );
  const zIndexBlock = buildThemeInterfaceBlock(
    zIndex,
    'ZIndexTokensInterface',
    mergedTheme,
  );

  const content = `
// AUTO-GENERATED by vbox-type-gen
// Do not edit by hand. Regenerate with npx vbox-type-gen'

import type { AliasMap, ColorTokensInterface, FontSizeTokensInterface, FontWeightTokensInterface, FontFamilyTokensInterface, LetterSpacingTokensInterface, LineHeightTokensInterface, SpacingTokensInterface, BorderRadiusTokensInterface, BoxShadowTokensInterface, ZIndexTokensInterface } from "@veebox/core";

declare module "@veebox/core" {
  ${aliasDts}
  ${colorBlock}
  ${fontSizeBlock}
  ${fontWeightBlock}
  ${fontFamilyBlock}
  ${lineHeightBlock}
  ${letterSpacingBlock}
  ${spacingBlock}
  ${borderRadiusBlock}
  ${boxShadowBlock}
  ${zIndexBlock}
}
  `;

  await fs.writeFile(outFile, content, 'utf8');
  console.log('wrote', outFile);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
