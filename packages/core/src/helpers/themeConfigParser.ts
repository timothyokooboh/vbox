import type { VBoxPluginOptions } from '../types';
import { __DEV__ } from './isDevelopment';

type Theme = Required<VBoxPluginOptions>['theme'];
type ThemeKeys = keyof Theme;

const themeCategories: readonly ThemeKeys[] = [
  'color',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'lineHeight',
  'letterSpacing',
  'spacing',
  'borderRadius',
  'boxShadow',
  'zIndex',
];

// ---------- helper: isReference ----------
const isReference = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('$');

const parseReferencePath = (reference: string) => {
  if (!reference) return [];
  return reference.replace(/^\$/, '').split('.');
};

export const resolveToken = (
  theme: Theme,
  reference: string,
  stack: string[] = [],
): string => {
  const path = parseReferencePath(reference);
  const [category, key] = path as [ThemeKeys, string];

  const target = theme?.[category]?.[key];

  if (target === undefined) {
    if (__DEV__) {
      console.warn(`[VBox] Unknown token reference: ${reference}`);
    }
    return reference;
  }

  const id = `${category}.${key}`;
  if (stack.includes(id)) {
    if (__DEV__) {
      console.warn(
        `[VBox] Circular token reference detected: ${[...stack, id].join(' → ')}`,
      );
    }
    return reference;
  }

  // If the target is a string and itself a reference, recurse (non-color schemes)
  if (typeof target === 'string' && isReference(target)) {
    return resolveToken(theme, target, [...stack, id]);
  }

  // For non-string (objects) or string primitives, return as-is.
  // Note: for colors we will treat references differently in normalizeTheme (we will produce var(...))
  return typeof target === 'string' ? target : (target as any);
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

  for (const category of themeCategories) {
    const group = theme[category];
    if (!group) continue;

    normalized[category] = {};

    for (const [key, value] of Object.entries(group)) {
      if (category === 'color') {
        // handle primitive color strings e.g. "#fff"
        if (typeof value === 'string' && !isReference(value)) {
          normalized.color![key] = value;
          continue;
        }

        // handle primitive reference strings e.g. "$color.red-200"
        if (typeof value === 'string' && isReference(value)) {
          const path = parseReferencePath(value);
          const [, pathValue] = path as [ThemeKeys, string];

          // produce a CSS custom property
          // example: normalized.color['danger'] = 'var(--color-red-200)'
          normalized.color![key] = `var(--color-${pathValue})`;

          // No need to add a dark override. The referenced token will handle that.
          continue;
        }

        // handle dark mode aware color objects: { default: '#..', dark: '#..' }
        if (value && typeof value === 'object') {
          const obj = value as Record<string, string>;
          const defaultVal = obj.default;

          // set default (for :root)
          if (defaultVal && typeof defaultVal === 'string') {
            normalized.color![key] = defaultVal;
          } else {
            if (__DEV__) {
              console.warn(`[VBox] Invalid default value for color.${key}`);
            }
            continue;
          }

          // if dark exists, add to dark map (we specifically support "dark")
          if (obj.dark && typeof obj.dark === 'string') {
            colorDarkMap[key] = obj.dark;
          }

          continue;
        }

        // Unknown color shape
        if (__DEV__) {
          console.warn(`[VBox] Unsupported color value for ${key}:`, value);
        }
        continue;
      } else {
        // ----------------------------
        // Non-color categories (unchanged behavior)
        // ----------------------------
        if (value && typeof value === 'string' && isReference(value)) {
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
  let rootCss = ':root{';
  // dark block (inside html.dark {...})
  let darkCss = 'html.dark{';

  for (const [category, group] of Object.entries(normalized)) {
    for (const [key, value] of Object.entries(group)) {
      const categoryKebab = category.replace(
        /[A-Z]/g,
        (m) => `-${m.toLowerCase()}`,
      );
      rootCss += `--${categoryKebab}-${key}: ${value};`;

      // if this is a color and we have a dark override for it, emit dark override:
      if (category === 'color' && colorDarkMap[key]) {
        darkCss += `--${categoryKebab}-${key}: ${colorDarkMap[key]};`;
      }
    }
  }

  rootCss += '}';
  darkCss += '}';

  // If no dark entries, don’t output an empty dark block
  const css =
    darkCss === 'html.dark{}' ? `${rootCss}` : `${rootCss}\n${darkCss}`;
  return css;
};
