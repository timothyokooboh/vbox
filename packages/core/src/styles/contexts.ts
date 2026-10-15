import { DefaultBreakpoints, InteractionStyleKeys } from '../constants.js';
import { toKebabCase } from '../helpers/toKebabCase.js';
import type { StyleContext } from './types.js';

export const canonicalState = (key: string) =>
  toKebabCase(key).replace(/^_/, '');
const states = InteractionStyleKeys.map(canonicalState);
const breakpoints = Object.keys(DefaultBreakpoints);

const presenceRank = (
  context: StyleContext,
  kind: StyleContext[number]['kind'],
  vocabulary: readonly string[],
) =>
  context.reduce((rank, step) => {
    const index = vocabulary.indexOf(step.value);
    return step.kind === kind && index >= 0 ? rank | (1 << index) : rank;
  }, 0);

/** Interaction first, then theme, then named breakpoint: never mount order or units. */
export const compareStyleContexts = (a: StyleContext, b: StyleContext) =>
  presenceRank(a, 'state', states) - presenceRank(b, 'state', states) ||
  presenceRank(a, 'theme', ['dark']) - presenceRank(b, 'theme', ['dark']) ||
  presenceRank(a, 'breakpoint', breakpoints) -
    presenceRank(b, 'breakpoint', breakpoints) ||
  Number(a.some((step) => step.kind !== 'selector')) -
    Number(b.some((step) => step.kind !== 'selector'));

/** Conditions commute only until a selector changes the target. */
export const normalizeStyleContext = (context: StyleContext): StyleContext => {
  const result: Array<StyleContext[number]> = [];
  let segment: Array<StyleContext[number]> = [];
  const flush = () => {
    for (const [kind, vocabulary] of [
      ['theme', ['dark']],
      ['breakpoint', breakpoints],
      ['state', states],
    ] as const) {
      for (const value of vocabulary)
        if (segment.some((step) => step.kind === kind && step.value === value))
          result.push({ kind, value });
    }
    result.push(
      ...segment.filter(
        (step) => step.kind === 'media' || step.kind === 'container',
      ),
    );
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
