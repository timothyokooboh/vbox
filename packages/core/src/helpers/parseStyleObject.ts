import { camelCase, kebabCase } from "change-case";
import { useDesignTokens } from "./useDesignTokens";
import { isValidCssDeclaration } from "./isValidCssDeclaration";
import { isObjectLiteral } from "./isObjectLiteral";
import { isValidCssSelector } from "./isValidCssSelector";
import type {
  StandardProperties,
  StandardPropertiesHyphenFallback,
} from "csstype";
import type { Breakpoints, VBoxProps } from "../types";

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
const normalizeKey = (
  key: string,
  aliases: Record<string, keyof StandardProperties>,
): string => {
  const cached = normalizeCache.get(key);
  if (cached) return cached;

  const camelCaseKey = camelCase(key);
  const resolved = aliases[camelCaseKey];
  const resolvedKey = (resolved ?? camelCaseKey) as string;
  normalizeCache.set(key, resolvedKey);
  return resolvedKey;
};

// Convert a style map into validated kebab-case CSS rules and nested selectors
const extractStylesFromValue = (value: unknown) => {
  let rootStyleRecord: Record<string, string> = {};
  const nestedStyleRecord: Record<string, Record<string, string>> = {};

  if (!value || typeof value !== "object")
    return { rootStyleRecord, nestedStyleRecord };

  for (const [subKey, subVal] of Object.entries(value)) {
    if (isObjectLiteral(subVal)) {
      if (!isValidCssSelector(subKey)) {
        console.warn(`[VBox] Invalid nested selector "${subKey}"`);
        continue;
      }

      let nestedValid: Record<string, string> = {};
      for (const [prop, val] of Object.entries(subVal)) {
        const propK = kebabCase(prop) as keyof StandardPropertiesHyphenFallback;
        let propVal = String(val);
        if (propK === "content" && !/^['"]/.test(propVal)) {
          propVal = `"${propVal}"`;
        }

        if (isValidCssDeclaration(propK, propVal)) {
          nestedValid[propK] = propVal;
        } else {
          nestedValid = useDesignTokens(propK, propVal, nestedValid);
        }
      }

      nestedStyleRecord[subKey] = nestedValid;
    } else {
      const propK = kebabCase(subKey) as keyof StandardPropertiesHyphenFallback;
      let propVal = String(subVal);
      if (propK === "content" && !/^['"]/.test(propVal))
        propVal = `"${propVal}"`;
      if (isValidCssDeclaration(propK, propVal)) {
        rootStyleRecord[propK] = propVal;
      } else {
        rootStyleRecord = useDesignTokens(propK, propVal, rootStyleRecord);
      }
    }
  }

  return { rootStyleRecord, nestedStyleRecord };
};

const processMediaQueries = (styleObj: VBoxProps["mq"]) => {
  if (!styleObj) return;
  const customMediaQueries: Record<string, Record<string, string>> = {};
  const selectorBlocks: Record<string, Record<string, string>> = {};

  for (const [query, styles] of Object.entries(styleObj)) {
    if (!query.startsWith("@media ")) {
      console.warn(
        `[VBox] Invalid mq key "${query}". It must start with "@media".`,
      );
      continue;
    }
    const { rootStyleRecord, nestedStyleRecord } =
      extractStylesFromValue(styles);
    customMediaQueries[query] = rootStyleRecord;
    for (const [sel, s] of Object.entries(nestedStyleRecord)) {
      selectorBlocks[`mbp::${query}::${sel}`] = s;
    }
  }

  return {
    customMediaQueries,
    selectorBlocks,
  };
};

const processContainerQueries = (styleObj: VBoxProps["cq"]) => {
  if (!styleObj) return;

  const containerQueries: Record<string, Record<string, string>> = {};
  const selectorBlocks: Record<string, Record<string, string>> = {};

  for (const [query, styles] of Object.entries(styleObj)) {
    if (!query.startsWith("@container ")) {
      console.warn(
        `[VBox] Invalid cq key "${query}". It must start with "@container".`,
      );
      continue;
    }
    const { rootStyleRecord, nestedStyleRecord } =
      extractStylesFromValue(styles);
    containerQueries[query] = rootStyleRecord;
    for (const [sel, s] of Object.entries(nestedStyleRecord))
      selectorBlocks[`cbp::${query}::${sel}`] = s;
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
  aliases: Record<string, keyof StandardProperties>;
  className: string;
  breakpoints: Breakpoints;
}) => {
  let rootStyles: Record<string, string> = {};
  const rootDarkStyles: Record<string, string> = {};
  const pseudoStyles: Record<string, Record<string, string>> = {};
  const mediaStyles: Record<string, Record<string, string>> = {};
  let customMediaQueries: Record<string, Record<string, string>> = {};
  let containerQueries: Record<string, Record<string, string>> = {};
  let selectorBlocks: Record<string, Record<string, string>> = {};

  for (const [key, rawValue] of Object.entries(obj)) {
    if (!rawValue) continue;

    const resolvedKey = normalizeKey(key, aliases);

    // 1) handle direct CSS properties (including alias resolution)
    const cssProp = kebabCase(
      resolvedKey,
    ) as keyof StandardPropertiesHyphenFallback;
    const stringValue = String(rawValue);
    if (isValidCssDeclaration(cssProp, stringValue)) {
      rootStyles[cssProp] = stringValue;
    } else {
      rootStyles = useDesignTokens(cssProp, stringValue, rootStyles);
    }

    // 2) unified `css` escape hatch
    if (resolvedKey === "css") {
      for (const k in rawValue) {
        const v = rawValue[k as keyof typeof rawValue];

        if (k.startsWith("@media ") && isObjectLiteral(v)) {
          customMediaQueries = {
            ...customMediaQueries,
            ...processMediaQueries(rawValue as VBoxProps["mq"])
              ?.customMediaQueries,
          };

          selectorBlocks = {
            ...selectorBlocks,
            ...processMediaQueries(rawValue as VBoxProps["mq"])?.selectorBlocks,
          };
        } else if (k.startsWith("@container ") && isObjectLiteral(v)) {
          containerQueries = {
            ...containerQueries,
            ...processContainerQueries(rawValue as VBoxProps["cq"])
              ?.containerQueries,
          };

          selectorBlocks = {
            ...selectorBlocks,
            ...processContainerQueries(rawValue as VBoxProps["cq"])
              ?.selectorBlocks,
          };
        } else {
          const { rootStyleRecord, nestedStyleRecord } =
            extractStylesFromValue(rawValue);
          Object.assign(rootStyles, rootStyleRecord);
          for (const [sel, styles] of Object.entries(nestedStyleRecord)) {
            selectorBlocks[sel] = styles;
          }
        }
      }
      continue;
    }

    // 2) process dark theme styles
    if (resolvedKey === "dark" && typeof rawValue === "object") {
      const { rootStyleRecord, nestedStyleRecord } =
        extractStylesFromValue(rawValue);
      Object.assign(rootDarkStyles, rootStyleRecord);
      for (const [sel, styles] of Object.entries(nestedStyleRecord)) {
        selectorBlocks[`dark::${sel}`] = styles;
      }
      continue;
    }

    // 3) pseudo props (e.g. _hover, _focus)
    if (
      ["hover", "focus", "focusVisible", "focusWithin", "_disabled"].includes(
        resolvedKey,
      )
    ) {
      const pseudo =
        resolvedKey === "_disabled" ? resolvedKey.slice(1) : resolvedKey;
      if (typeof rawValue === "object") {
        const { rootStyleRecord, nestedStyleRecord } =
          extractStylesFromValue(rawValue);
        pseudoStyles[pseudo] = rootStyleRecord;
        for (const [sel, styles] of Object.entries(nestedStyleRecord)) {
          const prefix = ":";
          const resolvedSel = sel.includes("&")
            ? sel.replace(/&/g, `.${className}${prefix}${pseudo}`)
            : `.${className}${prefix}${pseudo} ${sel}`;
          selectorBlocks[resolvedSel] = styles;
        }
      }
      continue;
    }

    // 4) pseudos (advanced pseudo selectors object)
    if (resolvedKey === "pseudos" && typeof rawValue === "object") {
      for (const [pseudoSelector, styles] of Object.entries(rawValue)) {
        if (!pseudoSelector.startsWith(":")) {
          console.warn(
            `[VBox] Invalid pseudo selector "${pseudoSelector}". It must start with ":" or "::"`,
          );
          continue;
        }
        const { rootStyleRecord, nestedStyleRecord } =
          extractStylesFromValue(styles);
        pseudoStyles[pseudoSelector] = rootStyleRecord;
        for (const [sel, s] of Object.entries(nestedStyleRecord)) {
          const resolvedSel = sel.includes("&")
            ? sel.replace(/&/g, `.${className}${pseudoSelector}`)
            : `.${className}${pseudoSelector} ${sel}`;
          selectorBlocks[resolvedSel] = s;
        }
      }
      continue;
    }

    // 5) custom media queries (mq)
    if (resolvedKey === "mq") {
      customMediaQueries = {
        ...customMediaQueries,
        ...processMediaQueries(rawValue as VBoxProps["mq"])?.customMediaQueries,
      };
      selectorBlocks = {
        ...selectorBlocks,
        ...processMediaQueries(rawValue as VBoxProps["mq"])?.selectorBlocks,
      };
      continue;
    }

    // 6) container queries (cq)
    if (resolvedKey === "cq") {
      containerQueries = {
        ...containerQueries,
        ...processContainerQueries(rawValue as VBoxProps["cq"])
          ?.containerQueries,
      };
      selectorBlocks = {
        ...selectorBlocks,
        ...processContainerQueries(rawValue as VBoxProps["cq"])?.selectorBlocks,
      };
      continue;
    }

    // 7) explicit breakpoints (sm, md, lg, xl)
    if (["sm", "md", "lg", "xl"].includes(resolvedKey)) {
      const bpKey = resolvedKey as keyof typeof breakpoints;
      if (typeof rawValue === "object") {
        const { rootStyleRecord, nestedStyleRecord } =
          extractStylesFromValue(rawValue);
        mediaStyles[breakpoints[bpKey]] = rootStyleRecord;
        for (const [sel, s] of Object.entries(nestedStyleRecord))
          selectorBlocks[`bp::${breakpoints[bpKey]}::${sel}`] = s;
      }
      continue;
    }
  }

  return {
    rootStyles,
    rootDarkStyles,
    pseudoStyles,
    mediaStyles,
    customMediaQueries,
    containerQueries,
    selectorBlocks,
  };
};
