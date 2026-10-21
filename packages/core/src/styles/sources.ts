import { canonicalState, normalizeStyleContext } from './contexts.js';
import { normalizeQuery } from './queries.js';
import { selectorContexts } from './selectors.js';
import { DefaultBreakpoints } from '../constants.js';
import type { AliasMap } from '../types.js';
import { readStyleObject } from '../helpers/readStyleObject.js';
import { getConditionKey } from '../helpers/resolveConfig.js';
import { normalizeKey } from '../helpers/normalizeKey.js';
import { serializeStyleValue } from './values.js';
import { toKebabCase } from '../helpers/toKebabCase.js';
import type { StyleContext, StyleDeclaration } from './types.js';

/** Composition does not discard duplicate declarations or infer owner priority. */
export const composeStyleSources = (
  grouped: unknown,
  direct: Record<string, unknown>,
  aliases: AliasMap,
): StyleDeclaration[] => {
  const declarations: StyleDeclaration[] = [];
  const collect = (
    styles: Record<string, unknown>,
    context: StyleContext = [],
  ) => {
    for (const [key, value] of Object.entries(styles)) {
      const condition = getConditionKey(key);
      if (condition) {
        const group = value as Record<string, unknown>;
        if (condition === 'declarations') collect(group, context);
        else if (
          condition === 'mq' ||
          condition === 'cq' ||
          condition === 'pseudos'
        ) {
          for (const [query, child] of Object.entries(group)) {
            const steps: StyleContext =
              condition === 'pseudos'
                ? selectorContexts(query, true)
                : [
                    {
                      kind: condition === 'mq' ? 'media' : 'container',
                      value: normalizeQuery(condition, query),
                    },
                  ];
            for (const step of steps)
              collect(child as Record<string, unknown>, [...context, step]);
          }
        } else {
          const step: StyleContext[number] =
            condition === 'dark'
              ? { kind: 'theme', value: 'dark' }
              : Object.hasOwn(DefaultBreakpoints, condition)
                ? { kind: 'breakpoint', value: condition }
                : {
                    kind: 'state',
                    value: canonicalState(condition),
                  };
          collect(group, [...context, step]);
        }
      } else if (value !== null && typeof value === 'object') {
        for (const step of selectorContexts(key))
          collect(value as Record<string, unknown>, [...context, step]);
      } else {
        const property = toKebabCase(normalizeKey(key, aliases));
        declarations.push({
          property,
          value: serializeStyleValue(property, value),
          context: normalizeStyleContext(context),
        });
      }
    }
  };
  if (Array.isArray(grouped)) {
    for (const source of grouped) {
      if (source === false) continue;
      collect(readStyleObject(source));
    }
  } else collect(readStyleObject(grouped));
  collect(readStyleObject(direct, 'individual'));
  return declarations;
};
