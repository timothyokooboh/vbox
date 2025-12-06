#!/usr/bin/env node
/*
  Generates vbox.d.ts with type augmentations for alias and design tokens
*/

import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";
import { DefaultDesignSystem } from "../constants.js";
import { deepMerge } from "../helpers/mergeTheme.js";

const __filename = fileURLToPath(import.meta.url);
const jiti = createJiti(__filename, { debug: true });

const root = process.cwd();
const configs = [
  path.resolve(root, "vbox.config.ts"),
  path.resolve(root, "vbox.config.js"),
  path.resolve(root, "vbox.config.cjs"),
  path.resolve(root, "vbox.config.mjs"),
];

const loadConfig = async () => {
  for (const config of configs) {
    if (await fs.pathExists(config)) {
      try {
        const mod = jiti(config);
        return mod?.default ?? mod;
      } catch (err) {
        console.error("Failed to load config:", config, err);
      }
    }
  }
  return null;
};

// Helpers

type ThemeShape = {
  color?: Record<string, any>;
  fontSize?: Record<string, any>;
  fontSizes?: Record<string, any>;
  fontWeight?: Record<string, any>;
  fontFamily?: Record<string, any>;
  lineHeight?: Record<string, any>;
  letterSpacing?: Record<string, any>;
  spacing?: Record<string, any>;
  borderRadius?: Record<string, any>;
  zIndex?: Record<string, any>;
};

const isReference = (v: unknown): v is string =>
  typeof v === "string" && v.startsWith("$");

function getBucket(theme: ThemeShape, category: string) {
  // strict map of valid categories
  const VALID_KEYS = {
    color: "color",
    fontSize: "fontSize",
    fontWeight: "fontWeight",
    fontFamily: "fontFamily",
    spacing: "spacing",
    lineHeight: "lineHeight",
    letterSpacing: "letterSpacing",
    borderRdaius: "borderRadius",
    zIndex: "zIndex",
  } as const;

  const key = VALID_KEYS[category as keyof typeof VALID_KEYS];
  if (!key) return undefined;

  const bucket = (theme as any)[key];
  return typeof bucket === "object" && bucket ? bucket : undefined;
}

// Resolve token for non-color categories -> returns a string (primitive) or raw ref fallback
function resolvePrimitiveToken(
  theme: ThemeShape,
  category: string,
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
      `[vbox-type-gen] Circular reference detected: ${[...stack, id].join(" -> ")}`,
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

  if (typeof val === "string" && isReference(val)) {
    const cleaned = val.replace(/^\$/, "");
    const [nextCat, ...rest] = cleaned.split(".");
    const nextKey = rest.join(".");
    return resolvePrimitiveToken(theme, nextCat, nextKey, [...stack, id]);
  }

  if (typeof val === "string") return val;

  // fallback for unexpected object
  if (typeof val === "object" && val !== null) {
    if (typeof (val as any).default === "string") return (val as any).default;
    const first = Object.values(val).find((v) => typeof v === "string");
    return (first as string) ?? `$${category}.${key}`;
  }

  return `$${category}.${key}`;
}

// Resolve color token -> returns array of string values (modes) or resolved strings
function resolveColorTokenValues(
  theme: ThemeShape,
  key: string,
  stack: string[] = [],
): string[] {
  const bucket = theme.color ?? {};
  const id = `color.${key}`;

  if (stack.includes(id)) {
    console.warn(
      `[vbox-type-gen] Circular color reference: ${[...stack, id].join(" -> ")}`,
    );
    return [`$color.${key}`];
  }

  const val = bucket[key];
  if (val === undefined) {
    console.warn(`[vbox-type-gen] Unknown color token: ${key}`);
    return [`$color.${key}`];
  }

  if (typeof val === "string" && !isReference(val)) {
    return [val];
  }

  if (typeof val === "string" && isReference(val)) {
    const cleaned = val.replace(/^\$/, "");
    const [catRaw, ...rest] = cleaned.split(".");
    const cat = catRaw; // must match exactly 'color'
    const refKey = rest.join(".");

    if (cat !== "color") {
      console.warn(
        `[vbox-type-gen] Invalid reference category '${cat}' in color token '${key}'.`,
      );
      return [`$color.${key}`];
    }

    return resolveColorTokenValues(theme, refKey, [...stack, id]);
  }

  if (typeof val === "object" && val !== null) {
    return Object.values(val).filter((v) => typeof v === "string") as string[];
  }

  return [`$color.${key}`];
}

// Build interface entries for a category
function buildThemeInterfaceBlock(
  values: Record<string, any>,
  typeName: string,
  theme?: ThemeShape,
) {
  const lines: string[] = [];

  for (const [k, rawVal] of Object.entries(values)) {
    // Colors -> possibly union of mode values
    if (typeName === "ColorTokensInterface") {
      // resolve possibly referenced values to an array of string values
      const resolved = resolveColorTokenValues(theme ?? {}, k);
      // create JSDoc listing modes and values; if original rawVal is object with keys, include mode names
      let jsdoc = "";
      if (typeof rawVal === "object" && rawVal !== null) {
        const modeLines = Object.entries(rawVal)
          .filter(([, v]) => typeof v === "string")
          .map(([mode, v]) => `${mode}: ${v}`)
          .join("\n * ");
        jsdoc = `/**\n * ${modeLines}\n */\n`;
      } else if (typeof rawVal === "string" && isReference(rawVal)) {
        const resolvedLines = resolved.join(" | ");
        jsdoc = `/**\n * ${resolvedLines}\n */\n`;
      } else if (typeof rawVal === "string") {
        jsdoc = `/**\n * ${rawVal}\n */\n`;
      }

      const uniq = Array.from(new Set(resolved));
      const union = uniq.map((s) => JSON.stringify(s)).join(" | ") || "string";
      lines.push(`${jsdoc}  ${JSON.stringify(k)}: ${union};`);
    } else {
      // Non-color categories: resolve references to single primitive string
      let finalValue: string;
      if (typeof rawVal === "string" && isReference(rawVal)) {
        const cleaned = rawVal.replace(/^\$/, "");
        const [catRaw, ...rest] = cleaned.split(".");
        const refCat = catRaw;
        const refKey = rest.join(".");
        finalValue = resolvePrimitiveToken(theme ?? {}, refCat, refKey);
      } else if (typeof rawVal === "object" && rawVal !== null) {
        // it's unexpected for non-color, but try to pick default or first string
        finalValue =
          (rawVal as any).default ??
          Object.values(rawVal).find((v: any) => typeof v === "string") ??
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

  return `interface ${typeName} {\n${lines.join("\n")}\n}\n`;
}

const buildAliasDts = (aliases = {}) => {
  const entries = Object.entries(aliases)
    .map(([k, v]) => `    ${k}: "${v}";`)
    .join("\n");
  return `
interface AliasMap {
${entries || "    // no user aliases"}
}
`;
};

const main = async () => {
  const config = await loadConfig();

  if (!config) {
    console.log(
      "Could not find either vbox.config.ts or vbox.config.js file at the root of the project",
    );
    // return;
  }

  const enableDefaultTokens = config?.defaultDesignSystem !== false;
  const base = enableDefaultTokens ? DefaultDesignSystem : {};
  const mergedTheme = deepMerge(base as any, config?.theme ?? {});

  const aliases = config?.aliases?.values ?? config?.alias?.values ?? {};
  const color = mergedTheme?.color ?? {};
  const fontSizes = mergedTheme?.fontSize ?? {};
  const fontWeights = mergedTheme?.fontWeight ?? {};
  const fontFamilies = mergedTheme?.fontFamily ?? {};
  const lineHeights = mergedTheme?.lineHeight ?? {};
  const letterSpacings = mergedTheme?.letterSpacing ?? {};
  const spacings = mergedTheme?.spacing ?? {};
  const borderRadius = mergedTheme?.borderRadius ?? {};
  const zIndex = mergedTheme?.zIndex ?? {};

  const outFile = path.resolve(root, "vbox.d.ts");

  const aliasDts = buildAliasDts(aliases);
  const colorBlock = buildThemeInterfaceBlock(
    color,
    "ColorTokensInterface",
    mergedTheme,
  );
  const fontSizeBlock = buildThemeInterfaceBlock(
    fontSizes,
    "FontSizeTokensInterface",
    mergedTheme,
  );
  const fontWeightBlock = buildThemeInterfaceBlock(
    fontWeights,
    "FontWeightTokensInterface",
    mergedTheme,
  );
  const fontFamilyBlock = buildThemeInterfaceBlock(
    fontFamilies,
    "FontFamilyTokensInterface",
    mergedTheme,
  );
  const lineHeightBlock = buildThemeInterfaceBlock(
    lineHeights,
    "LineHeightTokensInterface",
    mergedTheme,
  );
  const letterSpacingBlock = buildThemeInterfaceBlock(
    letterSpacings,
    "LetterSpacingTokensInterface",
    mergedTheme,
  );
  const spacingBlock = buildThemeInterfaceBlock(
    spacings,
    "SpacingTokensInterface",
    mergedTheme,
  );
  const borderRadiusBlock = buildThemeInterfaceBlock(
    borderRadius,
    "BorderRadiusTokensInterface",
    mergedTheme,
  );
  const zIndexBlock = buildThemeInterfaceBlock(
    zIndex,
    "ZIndexTokensInterface",
    mergedTheme,
  );

  const content = `
// AUTO-GENERATED by vbox-type-gen
// Do not edit by hand. Regenerate with npx vbox-type-gen'

import type { AliasMap, ColorTokensInterface, FontSizeTokensInterface, FontWeightTokensInterface, FontFamilyTokensInterface, LetterSpacingTokensInterface, LineHeightTokensInterface, SpacingTokensInterface, BorderRadiusTokensInterface, ZIndexTokensInterface } from "@vbox/core";

declare module "@vbox/core" {
  ${aliasDts}
  ${colorBlock}
  ${fontSizeBlock}
  ${fontWeightBlock}
  ${fontFamilyBlock}
  ${lineHeightBlock}
  ${letterSpacingBlock}
  ${spacingBlock}
  ${borderRadiusBlock}
  ${zIndexBlock}
}
  `;

  await fs.writeFile(outFile, content, "utf8");
  console.log("wrote", outFile);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
