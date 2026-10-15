import selectorParser from 'postcss-selector-parser';
import { InteractionStyleKeys } from '../constants.js';
import { getConditionKey } from '../helpers/resolveConfig.js';
import { canonicalState } from './contexts.js';
import type { StyleContext } from './types.js';

/** Parse lists rather than splitting commas inside functions or attribute values. */
export const selectorContexts = (
  input: string,
  pseudo = false,
): StyleContext => {
  let root: selectorParser.Root;
  try {
    root = selectorParser().astSync(input);
  } catch (error) {
    throw new TypeError(
      `[VBox] Invalid selector ${JSON.stringify(input)}: ${(error as Error).message}`,
    );
  }
  const invalid = () => {
    throw new TypeError(
      `[VBox] Invalid selector ${JSON.stringify(input)}: expected a nonempty selector list with balanced syntax and no declaration blocks.`,
    );
  };
  if (Reflect.get(root, 'trailingComma')) invalid();
  const unescapeForValidation = (value: string) =>
    value.replace(/\\(?:[0-9a-f]{1,6}\s?|.)/gi, 'x');
  root.walk((node) => {
    if (node.type === 'selector') {
      const nodes = node.nodes.filter((child) => child.type !== 'comment');
      if (!nodes.length || nodes.at(-1)?.type === 'combinator') invalid();
      if (
        nodes.some(
          (child, index) =>
            child.type === 'combinator' &&
            nodes[index - 1]?.type === 'combinator',
        )
      )
        invalid();
    } else if (node.type === 'combinator') {
      if (![' ', '>', '+', '~', '||'].includes(node.value)) invalid();
    } else if (node.type === 'tag' || node.type === 'pseudo') {
      if (
        /[;{}@]/.test(
          unescapeForValidation(
            node.type === 'tag' ? node.toString() : node.value,
          ),
        )
      )
        invalid();
    } else if (node.type === 'attribute') {
      if (node.operator && node.value === undefined) invalid();
      if (
        /[;{}@]/.test(
          unescapeForValidation(node.raws?.attribute ?? node.attribute),
        )
      )
        invalid();
      if (
        !node.quoteMark &&
        /[;{}@]/.test(
          unescapeForValidation(node.raws?.value ?? node.value ?? ''),
        )
      )
        invalid();
    }
  });
  return root.nodes.map((branch) => {
    let nestedParent = false;
    branch.walkNesting(() => {
      nestedParent = true;
    });
    if (
      !pseudo &&
      nestedParent &&
      !branch.nodes.some((node) => node.type === 'nesting')
    )
      throw new TypeError(
        `[VBox] Selector ${JSON.stringify(input)} needs an outer & anchor; a parent reference only inside a function can leak outside the style target. Use &:is(...) or an explicit ancestor & selector.`,
      );
    const value = branch.toString().trim();
    if (!value || (pseudo && !value.startsWith(':')))
      throw new TypeError(
        `[VBox] Invalid ${pseudo ? 'pseudos' : 'declarations'} selector ${JSON.stringify(input)}.`,
      );
    const match = (pseudo ? /^:([a-z-]+)$/ : /^&:([a-z-]+)$/).exec(value);
    const condition = match && getConditionKey(match[1]);
    if (condition && InteractionStyleKeys.some((key) => key === condition))
      return { kind: 'state', value: canonicalState(condition) };
    return { kind: 'selector', value: pseudo ? `&${value}` : value };
  });
};
