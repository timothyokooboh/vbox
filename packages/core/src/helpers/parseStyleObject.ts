import { isObjectLiteral } from './isObjectLiteral';
import type { StandardPropertiesHyphen } from 'csstype';
import type { AliasMap, Breakpoints, VBoxProps } from '../types';
import { toKebabCase } from './toKebabCase';
import { kebabToCamelCase } from './kebabToCamelCase';
import { isValidCssSelector } from './isValidCssSelector';
import { isValidCssDeclaration } from './isValidCssDeclaration';
import { parseTokens } from './parseTokens';
import { __DEV__ } from './isDevelopment';

const normalizeCache = new Map<string, string>();

/**
 * Normalizes a style key by resolving alias names to their corresponding
 * CSS property. The key is converted to camelCase before lookup.
 *
 * If the key is a known alias, the associated CSS property is returned.
 * Otherwise, the camelCased key is returned unchanged.
 *
 * Results are cached to avoid repeated normalization work.
 */
export const normalizeKey = (key: string, aliases: AliasMap): string => {
  const cached = normalizeCache.get(key);
  if (cached) return cached;

  const camelCaseKey = kebabToCamelCase(key);
  const resolvedKey = aliases[camelCaseKey as keyof typeof aliases];
  const finalKey = resolvedKey ?? camelCaseKey;
  normalizeCache.set(key, finalKey);

  return finalKey;
};

// Convert a style map into validated kebab-case CSS rules and nested selectors
const extractStylesFromValue = (value: unknown, aliases: AliasMap) => {
  const rootStyleRecord: Record<string, string> = {};
  const nestedStyleRecord: Record<string, Record<string, string>> = {};

  if (!value || !isObjectLiteral(value)) {
    return { rootStyleRecord, nestedStyleRecord };
  }

  for (const [subKey, subVal] of Object.entries(value)) {
    if (isObjectLiteral(subVal)) {
      if (!isValidCssSelector(subKey)) {
        continue;
      }

      const nestedValid: Record<string, string> = {};
      for (const [prop, val] of Object.entries(subVal)) {
        const propK = toKebabCase(prop) as keyof StandardPropertiesHyphen;
        let propVal = String(val);
        if (propK === 'content' && !/^['"]/.test(propVal)) {
          propVal = `"${propVal}"`;
        }

        const parsedValue = parseTokens(propVal);
        const parsedKey = normalizeKey(propK, aliases);
        const parsedKebabKey = toKebabCase(parsedKey);
        if (isValidCssDeclaration(parsedKebabKey, parsedValue)) {
          nestedValid[parsedKebabKey] = parsedValue;
        }
      }

      nestedStyleRecord[subKey] = nestedValid;
    } else {
      const subKeyToKebabCase = toKebabCase(
        subKey,
      ) as keyof StandardPropertiesHyphen;
      let stringifiedSubVal = String(subVal);
      // auto-fix unquoted content values
      if (subKeyToKebabCase === 'content' && !/^['"]/.test(stringifiedSubVal)) {
        stringifiedSubVal = `"${stringifiedSubVal}"`;
      }

      const parsedValue = parseTokens(stringifiedSubVal);
      const parsedKey = normalizeKey(subKeyToKebabCase, aliases);
      const parsedKebabKey = toKebabCase(parsedKey);
      if (isValidCssDeclaration(parsedKebabKey, parsedValue)) {
        rootStyleRecord[parsedKebabKey] = parsedValue;
      }
    }
  }

  return { rootStyleRecord, nestedStyleRecord };
};

const processMediaQueries = (
  styleObj: VBoxProps['mq'],
  aliases: AliasMap,
  originalProp?: string,
) => {
  if (!styleObj) return;

  const customMediaQueries: Record<string, Record<string, string>> = {};
  const selectorBlocks: Record<string, Record<string, string>> = {};

  for (const [query, styles] of Object.entries(styleObj)) {
    if (!query.startsWith('@media ')) {
      if (originalProp === 'mq' && __DEV__) {
        console.warn(
          `[VBox] Invalid mq key "${query}". It must start with "@media".`,
        );
      }
      continue;
    }
    const { rootStyleRecord, nestedStyleRecord } = extractStylesFromValue(
      styles,
      aliases,
    );
    customMediaQueries[query] = rootStyleRecord;
    const prefix = `mbp::${query}::`;
    for (const [selector, value] of Object.entries(nestedStyleRecord)) {
      selectorBlocks[`${prefix}${selector}`] = value;
    }
  }

  return {
    customMediaQueries,
    selectorBlocks,
  };
};

const processContainerQueries = (
  styleObj: VBoxProps['cq'],
  aliases: AliasMap,
  originalProp?: string,
) => {
  if (!styleObj) return;

  const containerQueries: Record<string, Record<string, string>> = {};
  const selectorBlocks: Record<string, Record<string, string>> = {};

  for (const [query, styles] of Object.entries(styleObj)) {
    if (!query.startsWith('@container ')) {
      if (originalProp === 'cq' && __DEV__) {
        console.warn(
          `[VBox] Invalid cq key "${query}". It must start with "@container".`,
        );
      }
      continue;
    }
    const { rootStyleRecord, nestedStyleRecord } = extractStylesFromValue(
      styles,
      aliases,
    );
    containerQueries[query] = rootStyleRecord;
    const prefix = `cbp::${query}::`;
    for (const [selector, value] of Object.entries(nestedStyleRecord)) {
      selectorBlocks[`${prefix}${selector}`] = value;
    }
  }

  return {
    containerQueries,
    selectorBlocks,
  };
};

export const parseStyleObject = <T extends Record<string, unknown>>({
  obj,
  aliases,
  className,
  breakpoints,
}: {
  obj: T;
  aliases: AliasMap;
  className: string;
  breakpoints: Breakpoints;
}) => {
  const rootStyles: Record<string, string> = {};
  const rootDarkStyles: Record<string, string> = {};
  const pseudoStyles: Record<string, Record<string, string>> = {};
  const breakpointStyles: Record<string, Record<string, string>> = {};
  let customMediaQueries: Record<string, Record<string, string>> = {};
  let containerQueries: Record<string, Record<string, string>> = {};
  let selectorBlocks: Record<string, Record<string, string>> = {};

  for (const [key, rawValue] of Object.entries(obj)) {
    if (rawValue == undefined) continue;

    const resolvedKey = normalizeKey(key, aliases);

    const cssProp = toKebabCase(resolvedKey) as keyof StandardPropertiesHyphen;
    const stringValue = String(rawValue);

    const parsedValue = parseTokens(stringValue);
    const parsedKey = normalizeKey(cssProp, aliases);
    const parsedKebabKey = toKebabCase(parsedKey);

    if (isValidCssDeclaration(parsedKebabKey, parsedValue)) {
      rootStyles[parsedKebabKey] = parsedValue;
    }

    if (resolvedKey === 'declarations') {
      const { rootStyleRecord, nestedStyleRecord } = extractStylesFromValue(
        rawValue,
        aliases,
      );

      Object.assign(rootStyles, rootStyleRecord);
      for (const [sel, styles] of Object.entries(nestedStyleRecord)) {
        selectorBlocks[sel] = styles;
      }

      continue;
    }

    if (resolvedKey === 'dark' && typeof rawValue === 'object') {
      const { rootStyleRecord, nestedStyleRecord } = extractStylesFromValue(
        rawValue,
        aliases,
      );
      Object.assign(rootDarkStyles, rootStyleRecord);
      for (const [selector, value] of Object.entries(nestedStyleRecord)) {
        selectorBlocks[`dark::${selector}`] = value;
      }
      continue;
    }

    if (
      [
        'hover',
        'focus',
        'focusVisible',
        'focusWithin',
        'active',
        '_disabled',
      ].includes(resolvedKey)
    ) {
      const pseudo =
        resolvedKey === '_disabled' ? resolvedKey.slice(1) : resolvedKey;
      if (typeof rawValue === 'object') {
        const { rootStyleRecord, nestedStyleRecord } = extractStylesFromValue(
          rawValue,
          aliases,
        );
        pseudoStyles[pseudo] = rootStyleRecord;
        for (const [selector, styles] of Object.entries(nestedStyleRecord)) {
          const prefix = ':';
          const resolvedSel = selector.includes('&')
            ? selector.replace(/&/g, `.${className}${prefix}${pseudo}`)
            : `.${className}${prefix}${pseudo} ${selector}`;
          selectorBlocks[resolvedSel] = styles;
        }
      }
      continue;
    }

    if (resolvedKey === 'pseudos' && typeof rawValue === 'object') {
      for (const [pseudoSelector, styles] of Object.entries(rawValue)) {
        if (!pseudoSelector.startsWith(':')) {
          if (__DEV__) {
            console.warn(
              `[VBox] Invalid pseudo selector "${pseudoSelector}". It must start with ":" or "::"`,
            );
          }
          continue;
        }
        const { rootStyleRecord, nestedStyleRecord } = extractStylesFromValue(
          styles,
          aliases,
        );
        pseudoStyles[pseudoSelector] = rootStyleRecord;
        for (const [selector, styles] of Object.entries(nestedStyleRecord)) {
          const resolvedSel = selector.includes('&')
            ? selector.replace(/&/g, `.${className}${pseudoSelector}`)
            : `.${className}${pseudoSelector} ${selector}`;
          selectorBlocks[resolvedSel] = styles;
        }
      }
      continue;
    }

    if (resolvedKey === 'mq') {
      customMediaQueries = {
        ...customMediaQueries,
        ...processMediaQueries(rawValue as VBoxProps['mq'], aliases, 'mq')
          ?.customMediaQueries,
      };
      selectorBlocks = {
        ...selectorBlocks,
        ...processMediaQueries(rawValue as VBoxProps['mq'], aliases, 'mq')
          ?.selectorBlocks,
      };
      continue;
    }

    if (resolvedKey === 'cq') {
      containerQueries = {
        ...containerQueries,
        ...processContainerQueries(rawValue as VBoxProps['cq'], aliases, 'cq')
          ?.containerQueries,
      };
      selectorBlocks = {
        ...selectorBlocks,
        ...processContainerQueries(rawValue as VBoxProps['cq'], aliases, 'cq')
          ?.selectorBlocks,
      };
      continue;
    }

    if (['sm', 'md', 'lg', 'xl'].includes(resolvedKey)) {
      const bpKey = resolvedKey as keyof typeof breakpoints;
      if (typeof rawValue === 'object') {
        const { rootStyleRecord, nestedStyleRecord } = extractStylesFromValue(
          rawValue,
          aliases,
        );
        breakpointStyles[breakpoints[bpKey]] = rootStyleRecord;
        for (const [selector, styles] of Object.entries(nestedStyleRecord))
          selectorBlocks[`bp::${breakpoints[bpKey]}::${selector}`] = styles;
      }
      continue;
    }
  }

  return {
    rootStyles,
    rootDarkStyles,
    pseudoStyles,
    breakpointStyles,
    customMediaQueries,
    containerQueries,
    selectorBlocks,
  };
};
