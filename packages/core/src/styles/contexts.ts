import { InteractionStyleKeys } from '../constants.js';
import { toKebabCase } from '../helpers/toKebabCase.js';
import type { StyleContext } from './types.js';

export const canonicalState = (key: string) =>
  toKebabCase(key).replace(/^_/, '');
const states = InteractionStyleKeys.map(canonicalState);

const interactionPriority = (context: StyleContext) =>
  context.reduce(
    (rank, step) =>
      step.kind === 'state' ? rank | (1 << states.indexOf(step.value)) : rank,
    0,
  );

/** Compare highest-priority active state first, never raw condition count. */
export const compareStyleContexts = (a: StyleContext, b: StyleContext) =>
  interactionPriority(a) - interactionPriority(b) ||
  Number(a.some((step) => step.kind !== 'selector')) -
    Number(b.some((step) => step.kind !== 'selector'));

/** Conditions commute only until a selector changes the target. */
export const normalizeStyleContext = (context: StyleContext): StyleContext => {
  const result: Array<StyleContext[number]> = [];
  let segment: Array<StyleContext[number]> = [];
  const flush = () => {
    const active = new Set(
      segment.filter((step) => step.kind === 'state').map((step) => step.value),
    );
    result.push(...segment.filter((step) => step.kind !== 'state'));
    for (const value of states)
      if (active.has(value)) result.push({ kind: 'state', value });
    segment = [];
  };
  for (const step of context) {
    if (step.kind === 'selector') {
      flush();
      result.push(step);
    } else segment.push(step);
  }
  flush();
  return result;
};
