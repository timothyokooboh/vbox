import { babelParse } from '@vue/compiler-sfc';
import type { ElementNode, SourceLocation } from '@vue/compiler-dom';
import {
  getStyleBindingKey,
  getConditionKey,
  kebabToCamelCase,
  ObjectStyleKeys,
  toKebabCase,
  NonStylingTargetTags,
} from '@veebox/core';
import { createStyleError } from './diagnostics.js';
import type { VBoxSfcTransformPayload } from './types.js';

const excludedTargets = new Set<string>(NonStylingTargetTags);
const objectKeys = new Set(
  ObjectStyleKeys.flatMap((key) => [
    toKebabCase(key),
    toKebabCase(key).replace(/^_/, ''),
  ]),
);

const prefixedLiteral = (source: string, spread: boolean) => {
  try {
    const statement = babelParse(`(${source})`, {
      sourceType: 'module',
      plugins: ['typescript'],
    }).program.body[0];
    if (statement?.type !== 'ExpressionStatement') return false;
    const expression = statement.expression;
    if (!spread)
      return (
        expression.type === 'StringLiteral' &&
        getStyleBindingKey(expression.value) !== null
      );
    return (
      expression.type === 'ObjectExpression' &&
      expression.properties.some((property) => {
        if (property.type !== 'ObjectProperty' || property.computed)
          return false;
        const key =
          property.key.type === 'Identifier'
            ? property.key.name
            : property.key.type === 'StringLiteral'
              ? property.key.value
              : '';
        return getStyleBindingKey(key) !== null;
      })
    );
  } catch {
    return false;
  } // Vue owns expression syntax diagnostics.
};

type BindingOptions = {
  id: string;
  isKnownStyleKey: (key: string) => boolean;
  expression: (location: SourceLocation) => string;
};

/** Collect and validate one element without owning SFC edits or script wiring. */
export const collectStyleBindings = (
  node: ElementNode,
  { id, isKnownStyleKey, expression }: BindingOptions,
) => {
  const warnings: NonNullable<VBoxSfcTransformPayload['warnings']> = [];
  const removals: SourceLocation[] = [];
  const declarations: string[] = [];
  let grouped: string | undefined;
  const seen = new Set<string>();
  for (const prop of node.props) {
    if (prop.type === 7 && prop.name === 'bind') {
      const spread = !prop.arg;
      const expression = spread
        ? prop.exp
        : prop.arg?.type === 4 && !prop.arg.isStatic
          ? prop.arg
          : null;
      if (
        expression?.type === 4 &&
        prefixedLiteral(expression.content, spread)
      ) {
        warnings.push({
          message: `[VBox] ${id}:${prop.loc.start.line} Ordinary v-bind and dynamic names stay semantic. Use :vb="styles" for grouped/dynamic styling.`,
          loc: prop.loc.start,
        });
      }
    }
    const name =
      prop.type === 6
        ? prop.name
        : prop.name === 'bind' && prop.arg?.type === 4 && prop.arg.isStatic
          ? prop.arg.content
          : null;
    if (name && ['vbox', 'vbox-ignore', 'vboxignore'].includes(name)) {
      warnings.push({
        message: `[VBox] ${id}:${prop.loc.start.line} ${name} is a retired marker with no styling effect. Remove it and use vb-* or :vb for styling.`,
        loc: prop.loc.start,
      });
    }
    const key =
      name === 'vb' ? 'vb' : name === null ? null : getStyleBindingKey(name);
    if (key === null) continue;
    if (excludedTargets.has(node.tag)) {
      throw createStyleError(
        id,
        prop.loc.start,
        `${name} needs a rendered element; put the binding on the intended HTML/SVG element or component, not <${node.tag}>.`,
      );
    }
    if (
      !/^(?:--[-\w\u0080-\uFFFF]+|-?[A-Za-z_0-9\u0080-\uFFFF][-\w\u0080-\uFFFF]*)$/.test(
        key,
      )
    ) {
      throw createStyleError(
        id,
        prop.loc.start,
        `Invalid style property name ${JSON.stringify(name)}.`,
      );
    }
    if (name !== 'vb' && !isKnownStyleKey(key)) {
      warnings.push({
        message: `[VBox] ${id}:${prop.loc.start.line} Unrecognized style property "${key}". It remains styling; check the spelling or configure its alias. Future CSS properties are allowed.`,
        loc: prop.loc.start,
      });
    }
    const identity = name === 'vb' ? ':vb' : (getConditionKey(key) ?? key);
    if (seen.has(identity))
      throw createStyleError(
        id,
        prop.loc.start,
        `Duplicate style binding for ${key}; keep one spelling.`,
      );
    seen.add(identity);
    if (prop.type === 7 && prop.modifiers.length) {
      throw createStyleError(
        id,
        prop.loc.start,
        `Style binding modifiers are not supported; remove the modifier from ${name}.`,
      );
    }
    if (prop.type === 6 && (name === 'vb' || objectKeys.has(key))) {
      throw createStyleError(
        id,
        prop.loc.start,
        `${name} requires an object binding; use :${name}="{ ... }".`,
      );
    }
    if (prop.type === 7 && prop.exp?.type === 4 && !prop.exp.content.trim()) {
      throw createStyleError(
        id,
        prop.loc.start,
        `${name} requires a non-empty expression; omit the equals sign for Vue same-name shorthand.`,
      );
    }
    const value =
      prop.type === 6
        ? JSON.stringify(prop.value?.content ?? '')
        : prop.exp?.type === 4
          ? `(${expression(prop.exp.loc)})`
          : `(${kebabToCamelCase(name!)})`;
    if (name === 'vb') grouped = value;
    else declarations.push(`${JSON.stringify(key)}: ${value}`);
    removals.push(prop.loc);
  }
  return { declarations, grouped, removals, warnings };
};
