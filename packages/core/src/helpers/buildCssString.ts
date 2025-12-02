import { buildRules } from "./buildRules";
import { isObjectLiteral } from "./isObjectLiteral";
import { toKebabCase } from "./toKebabCase";

export const buildCssString = ({
  rootStyles,
  rootDarkStyles,
  pseudoStyles,
  selectorBlocks,
  breakpointStyles,
  customMediaQueries,
  containerQueries,
  className,
}: {
  rootStyles: Record<string, string>;
  rootDarkStyles: Record<string, string>;
  pseudoStyles: Record<string, Record<string, string>>;
  selectorBlocks: Record<string, Record<string, string>>;
  breakpointStyles: Record<string, Record<string, string>>;
  customMediaQueries: Record<string, Record<string, string>>;
  containerQueries: Record<string, Record<string, string>>;
  className: string;
}) => {
  // css string for base styles
  let cssString = `.${className} { ${buildRules(rootStyles)} }`;

  // append css string for dark theme styles

  if (
    isObjectLiteral(rootDarkStyles) &&
    Object.keys(rootDarkStyles).length > 0
  ) {
    cssString += `\nhtml.dark { .${className} { ${buildRules(rootDarkStyles)} } }`;
  }

  // pseudo blocks
  for (const [pseudo, styles] of Object.entries(pseudoStyles)) {
    const prefix = pseudo.startsWith(":") ? "" : ":";
    cssString += `\n.${className}${prefix}${toKebabCase(pseudo)} { ${buildRules(styles)} }`;

    // nested selectors that belong to this pseudo
    for (const [sel, nested] of Object.entries(selectorBlocks)) {
      if (!sel.startsWith(`.${className}${prefix}${pseudo}`)) continue;
      cssString += `\n${sel} { ${buildRules(nested)} }`;
    }
  }

  // media queries
  for (const [bp, styles] of Object.entries(breakpointStyles)) {
    cssString += `\n@media (min-width: ${bp}) { .${className} { ${buildRules(styles)} } }`;
  }

  // custom media queries
  for (const [query, styles] of Object.entries(customMediaQueries)) {
    cssString += `\n${query} { .${className} { ${buildRules(styles)} } }`;
  }

  // container queries
  for (const [query, styles] of Object.entries(containerQueries)) {
    cssString += `\n${query} { .${className} { ${buildRules(styles)} } }`;
  }

  // advanced selectors
  for (const [selector, styles] of Object.entries(selectorBlocks)) {
    const rules = Object.entries(styles)
      .map(([k, v]) => {
        const prop = toKebabCase(k);
        let val = String(v);
        if (prop === "content" && !/^['"]/.test(val)) val = `"${val}"`;
        return `${prop}: ${val};`;
      })
      .join(" ");

    const resolvedSelector = selector.includes("&")
      ? selector.replace(/&/g, `.${className}`)
      : `.${className} ${selector}`;

    if (!/^[\s\S]*\S[\s\S]*$/.test(resolvedSelector)) {
      console.warn(`[VBox] Skipping invalid selector: "${selector}"`);
      continue;
    }

    if (resolvedSelector.startsWith("bp::")) {
      const [, breakPoint, selectors] = resolvedSelector.split("::");
      cssString += `\n@media (min-width: ${breakPoint}) { ${selectors} { ${rules} } }`;
    } else if (resolvedSelector.startsWith("mbp::")) {
      const [, mediaQuery, selectors] = resolvedSelector.split("::");
      cssString += `\n${mediaQuery} { ${selectors} { ${rules} } }`;
    } else if (resolvedSelector.startsWith("cbp::")) {
      const [, containerQuery, selectors] = resolvedSelector.split("::");
      cssString += `\n${containerQuery} { ${selectors} { ${rules} } }`;
    } else if (resolvedSelector.startsWith("dark::")) {
      const [, selectors] = resolvedSelector.split("::");
      cssString += `\nhtml.dark { ${selectors} { ${rules} } }`;
    } else {
      cssString += `\n${resolvedSelector} { ${rules} }`;
    }
  }

  return cssString;
};
