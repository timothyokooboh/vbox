import type { AliasProps, AugmentedCSSProperties } from '../types';
import { injectCSS } from './injectCSS';
import { toKebabCase } from './toKebabCase';
import { parseTokens } from './parseTokens';
import { isValidCssDeclaration } from './isValidCssDeclaration';
import { normalizeKey } from './parseStyleObject';
import { DefaultAliases } from '../constants';
import { createDjb2Hash } from './createDjb2Hash';
import { __DEV__ } from './isDevelopment';
import { stableStringify } from './stableStringify';

export type KeyframeStep = 'from' | 'to' | `${number}%`;

export type KeyframeDefinition = Record<
  KeyframeStep,
  AugmentedCSSProperties | AliasProps
>;

export const keyframes = (
  identifierOrRules: string | KeyframeDefinition,
  rules?: KeyframeDefinition,
) => {
  const hasName = typeof identifierOrRules === 'string';
  const name = hasName ? identifierOrRules : 'vbox-kf';
  const resolvedRules = hasName ? rules : identifierOrRules;

  if (!resolvedRules || typeof resolvedRules !== 'object') {
    if (__DEV__) {
      console.error('[VBox] keyframes: rules object is required.');
    }

    return;
  }

  // create deterministic hash from definition
  const defString = stableStringify(resolvedRules);
  const hashed = createDjb2Hash(defString);

  const finalName = `${name}-${hashed}`;

  // build CSS @keyframes string
  let css = `@keyframes ${finalName} {\n`;

  for (const step of Object.keys(resolvedRules)) {
    const styles = resolvedRules[step as keyof typeof resolvedRules];
    css += `  ${step} {\n`;

    for (const prop in styles) {
      const normalizedProperty = normalizeKey(prop, DefaultAliases);
      const propertyInKebabCase = toKebabCase(normalizedProperty);
      const parsedValue = parseTokens(
        styles[prop as keyof typeof styles] as string,
      );

      if (isValidCssDeclaration(propertyInKebabCase, parsedValue)) {
        css += `    ${propertyInKebabCase}: ${parsedValue};\n`;
      }
    }

    css += `  }\n`;
  }

  css += `}`;

  injectCSS(css);

  return finalName;
};
