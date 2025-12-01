import type { App } from "vue";
import { DefaultAliases, DefaultBreakpoints } from "@vbox/core";
import cssResets from "@vbox/core/styles/resets.css?inline";
import VBox from "@/components/VBox.vue";
import {
  classNamePrefixKey,
  aliasKey,
  breakpointsKey,
} from "./injectionSymbols";

export type AliasStrategy = "merge" | "replace";

export interface VBoxPluginOptions {
  classNamePrefix?: string;
  cssResets?: boolean;
  breakpoints?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  aliases?: {
    strategy?: AliasStrategy;
    values: Record<string, keyof CSSStyleDeclaration>;
  };
  theme?: {
    colors?: Record<string, string>;
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, string>;
    fontFamily?: Record<string, string>;
    spacing?: Record<string, string>;
  };
}

// theme parser
type ThemeCategory =
  | "colors"
  | "fontSize"
  | "fontWeight"
  | "fontFamily"
  | "spacing";

type Theme = Required<VBoxPluginOptions>["theme"];

// Detect “$colors.red-200”
const isReference = (value: string) => value.startsWith("$");

// resolve "$colors.red-200" → theme.colors["red-200"] (recursively)
const resolveToken = (
  theme: Theme,
  reference: string,
  stack: string[] = [],
): string => {
  const path = reference.replace(/^\$/, "").split(".");
  const [category, key] = path as [ThemeCategory, string];

  const target = theme?.[category]?.[key];

  if (!target) {
    console.warn(`[VBox] Unknown token reference: ${reference}`);
    return reference;
  }

  // Prevent circular references
  const id = `${category}.${key}`;
  if (stack.includes(id)) {
    console.warn(
      `[VBox] Circular token reference detected: ${stack.join(" → ")}`,
    );
    return target;
  }

  // Recurse if needed
  if (target && typeof target === "string" && isReference(target)) {
    return resolveToken(theme, target, [...stack, id]);
  }

  return target;
};

// Flatten theme and resolve semantics
const normalizeTheme = (theme: Theme) => {
  const resolved: Record<string, Record<string, string>> = {};

  const categories: ThemeCategory[] = [
    "colors",
    "fontSize",
    "fontWeight",
    "fontFamily",
    "spacing",
  ];

  for (const category of categories) {
    const group = theme[category];
    if (!group) continue;

    resolved[category] = {};

    for (const [key, value] of Object.entries(group)) {
      if (value && typeof value === "string" && isReference(value)) {
        const primitiveValue = resolveToken(theme, value);
        resolved[category][key] = primitiveValue;
      } else {
        resolved[category][key] = value;
      }
    }
  }

  return resolved;
};

// Convert normalized tokens into CSS variable strings
const buildCSSVariables = (
  normalized: Record<string, Record<string, string>>,
) => {
  let css = ":root{";

  for (const [category, group] of Object.entries(normalized)) {
    for (const [key, value] of Object.entries(group)) {
      // use kebab-case for fontSize → font-size
      const categoryKebab = category.replace(
        /[A-Z]/g,
        (m) => `-${m.toLowerCase()}`,
      );

      css += `--${categoryKebab}-${key}: ${value};`;
    }
  }

  css += "}";
  return css;
};

// Inject <style> into document head
function injectCSS(css: string) {
  if (typeof window === "undefined") return; // SSR safety

  const id = "vbox-theme-tokens";
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;

  // Replace if exists
  if (styleEl) {
    styleEl.textContent += css;
    return;
  }

  // Create new
  styleEl = document.createElement("style");
  styleEl.id = id;
  styleEl.textContent += css;
  document.head.appendChild(styleEl);
}

export const VBoxPlugin = {
  install(app: App<Element>, options?: VBoxPluginOptions) {
    if (options?.theme) {
      const normalized = normalizeTheme(options.theme);
      const css = buildCSSVariables(normalized);
      injectCSS(css);
    }

    if (options?.cssResets) {
      injectCSS(cssResets);
    }

    const userDefinedAlias = options?.aliases?.values ?? {};
    const strategy = options?.aliases?.strategy ?? "merge";
    const finalAlias =
      strategy === "replace"
        ? Object.assign({}, userDefinedAlias)
        : Object.assign({}, DefaultAliases, userDefinedAlias);

    app.provide(breakpointsKey, options?.breakpoints ?? DefaultBreakpoints);
    app.provide(aliasKey, finalAlias);
    app.provide(classNamePrefixKey, options?.classNamePrefix);
    app.component("VBox", VBox);
  },
};
