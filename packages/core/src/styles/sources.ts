import { canonicalState, normalizeStyleContext } from './contexts.js';
import { InteractionStyleKeys } from '../constants.js';
import type { AliasMap } from '../types.js';
import { readStyleObject } from '../helpers/readStyleObject.js';
import { getConditionKey } from '../helpers/resolveConfig.js';
import { normalizeKey } from '../helpers/parseStyleObject.js';
import { parseTokens } from '../helpers/parseTokens.js';
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
            const simplePseudo = /^:[a-z-]+$/.test(query)
              ? getConditionKey(query.slice(1))
              : undefined;
            const state =
              simplePseudo &&
              InteractionStyleKeys.find((key) => key === simplePseudo);
            const step: StyleContext[number] =
              condition === 'mq'
                ? { kind: 'media', value: query }
                : condition === 'cq'
                  ? { kind: 'container', value: query }
                  : state
                    ? {
                        kind: 'state',
                        value: canonicalState(state),
                      }
                    : { kind: 'selector', value: `&${query}` };
            collect(child as Record<string, unknown>, [...context, step]);
          }
        } else {
          const step: StyleContext[number] =
            condition === 'dark'
              ? { kind: 'theme', value: 'dark' }
              : ['sm', 'md', 'lg', 'xl', '_2xl'].includes(condition)
                ? { kind: 'breakpoint', value: condition }
                : {
                    kind: 'state',
                    value: canonicalState(condition),
                  };
          collect(group, [...context, step]);
        }
      } else if (value !== null && typeof value === 'object') {
        collect(value as Record<string, unknown>, [
          ...context,
          { kind: 'selector', value: key },
        ]);
      } else {
        const property = toKebabCase(normalizeKey(key, aliases));
        let text = String(value);
        if (
          property === 'content' &&
          !/^['"]/.test(text) &&
          !/^(initial|inherit|unset|revert(?:-layer)?|normal|none)$/.test(text)
        )
          text = JSON.stringify(text);
        declarations.push({
          property,
          value: parseTokens(text),
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
