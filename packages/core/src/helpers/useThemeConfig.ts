import type { VBoxPluginOptions } from "../types";

// theme parser
type ThemeCategory =
  | "color"
  | "fontSize"
  | "fontWeight"
  | "fontFamily"
  | "spacing";

type Theme = Required<VBoxPluginOptions>["theme"];

// ---------- helper: isReference ----------
const isReference = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("$");

// ---------- resolveToken (unchanged for non-colors, safer for colors) ----------
// This function now returns a string for non-color categories (primitive resolved value).
// For colors we will not inline the final primitive for references — we return the referenced key name.
// However resolveToken still supports resolving non-color references (fontSize, spacing).
export const resolveToken = (
  theme: Theme,
  reference: string,
  stack: string[] = [],
): string => {
  const path = reference.replace(/^\$/, "").split(".");
  const [category, key] = path as [ThemeCategory, string];

  const target = theme?.[category]?.[key];

  if (target === undefined) {
    console.warn(`[VBox] Unknown token reference: ${reference}`);
    return reference;
  }

  const id = `${category}.${key}`;
  if (stack.includes(id)) {
    console.warn(
      `[VBox] Circular token reference detected: ${[...stack, id].join(" → ")}`,
    );
    return reference;
  }

  // If the target is a string and itself a reference, recurse (non-color schemes)
  if (typeof target === "string" && isReference(target)) {
    return resolveToken(theme, target, [...stack, id]);
  }

  // For non-string (objects) or string primitives, return as-is.
  // Note: for colors we will treat references differently in normalizeTheme (we will produce var(...))
  return typeof target === "string" ? target : (target as any);
};

// ---------- normalizeTheme (now supports mode-aware color tokens) ----------
/**
 * Returns:
 * {
 *   normalized: Record<Category, Record<string, string>>, // default/resolved values for :root
 *   colorDarkMap: Record<string, string> // only populated for colors that have dark value
 * }
 */
export const normalizeTheme = (theme: Theme) => {
  const normalized: Record<string, Record<string, string>> = {};
  const colorDarkMap: Record<string, string> = {};

  const categories: ThemeCategory[] = [
    "color",
    "fontSize",
    "fontWeight",
    "fontFamily",
    "spacing",
  ];

  for (const category of categories) {
    const group = theme[category];
    if (!group) continue;

    normalized[category] = {};

    for (const [key, value] of Object.entries(group)) {
      // ----------------------------
      // Special handling for colors
      // ----------------------------
      if (category === "color") {
        // CASE A: primitive string color: "#fff"
        if (typeof value === "string" && !isReference(value)) {
          normalized.color![key] = value;
          continue;
        }

        // CASE B: mode-aware object: { default: '#..', dark: '#..', ... }
        if (value && typeof value === "object") {
          // prefer `default`, otherwise try to pick any string property as fallback
          const obj = value as Record<string, string>;
          const defaultVal = obj.default ?? Object.values(obj)[0];

          // set default (for :root)
          if (typeof defaultVal === "string") {
            normalized.color![key] = defaultVal;
          } else {
            console.warn(`[VBox] Invalid default value for color.${key}`);
            continue;
          }

          // if dark exists, add to dark map (we specifically support "dark")
          if (typeof obj.dark === "string") {
            colorDarkMap[key] = obj.dark;
          }

          continue;
        }

        // CASE C: a reference string like "$color.red-200"
        if (typeof value === "string" && isReference(value)) {
          // parse referenced path: $color.red-200
          const refPath = value.replace(/^\$/, "").split(".");
          const [, refKey] = refPath as [string, string];

          // produce a var(...) reference so semantics follow modes:
          // example: normalized.color['danger'] = 'var(--color-red-200)'
          normalized.color![key] = `var(--color-${refKey})`;

          // No need to add a dark override for 'danger' — referenced var will handle that.
          continue;
        }

        // Unknown color shape
        console.warn(`[VBox] Unsupported color value for ${key}:`, value);
        continue;
      } else {
        // ----------------------------
        // Non-color categories (unchanged behavior)
        // ----------------------------
        if (value && typeof value === "string" && isReference(value)) {
          // Resolve references for non-color categories to primitive values
          const primitiveValue = resolveToken(theme, value);
          normalized[category]![key] = primitiveValue;
        } else {
          normalized[category]![key] = value as string;
        }
      }
    }
  }

  return { normalized, colorDarkMap };
};

// ---------- buildCSSVariables (produces :root + html.dark overrides) ----------
export const buildCSSVariables = (payload: {
  normalized: Record<string, Record<string, string>>;
  colorDarkMap: Record<string, string>;
}) => {
  const { normalized, colorDarkMap } = payload;

  // :root block
  let rootCss = ":root{";
  // dark block (inside html.dark {...})
  let darkCss = "html.dark{";

  for (const [category, group] of Object.entries(normalized)) {
    for (const [key, value] of Object.entries(group)) {
      const categoryKebab = category.replace(
        /[A-Z]/g,
        (m) => `-${m.toLowerCase()}`,
      );
      rootCss += `--${categoryKebab}-${key}: ${value};`;

      // if this is a color and we have a dark override for it, emit dark override:
      if (category === "color" && colorDarkMap[key]) {
        darkCss += `--${categoryKebab}-${key}: ${colorDarkMap[key]};`;
      }
    }
  }

  rootCss += "}";
  darkCss += "}";

  // If no dark entries, don’t output an empty dark block
  const css =
    darkCss === "html.dark{}" ? `${rootCss}` : `${rootCss}\n${darkCss}`;
  return css;
};
