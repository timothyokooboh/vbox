import { compareStyleContexts } from './contexts.js';
import type { StyleBundle } from './types.js';

/** Context always outranks ownership; outer callers win only after that comparison. */
export const serializeStyleBundles = (bundles: Iterable<StyleBundle>) =>
  [...bundles]
    .flatMap((bundle) =>
      bundle.rules.map((rule, order) => ({
        ...rule,
        key: bundle.key,
        ownerDepth: bundle.ownerDepth,
        order,
      })),
    )
    .sort(
      (a, b) =>
        compareStyleContexts(a.context, b.context) ||
        b.ownerDepth - a.ownerDepth ||
        (a.key < b.key ? -1 : a.key > b.key ? 1 : 0) ||
        a.order - b.order,
    )
    .map((rule) => rule.css)
    .join('\n');
