import { compareStyleContexts } from './contexts.js';
import type { Breakpoints } from '../types.js';
import type { StyleContext, StyleDeclaration } from './types.js';

/** Render matching contexts together, retaining authored declaration order. */
export const renderStyleDeclarations = (
  declarations: readonly StyleDeclaration[],
  className: string,
  breakpoints: Breakpoints,
) => {
  const ordered = [...declarations].sort((a, b) =>
    compareStyleContexts(a.context, b.context),
  );
  const blocks: Array<{ key: string; context: StyleContext; css: string }> = [];
  for (const declaration of ordered) {
    const key = JSON.stringify(declaration.context);
    let block = blocks.at(-1);
    // Only coalesce adjacent runs: an intervening selector may match the same node.
    if (block?.key !== key) {
      block = { key, context: declaration.context, css: '' };
      blocks.push(block);
    }
    block.css += `${declaration.property}:${declaration.value};`;
  }
  return blocks
    .map(({ context, css }) => {
      for (const step of [...context].reverse()) {
        const wrapper =
          step.kind === 'state'
            ? `&:where(:${step.value})`
            : step.kind === 'theme'
              ? ':where(html.dark) &'
              : step.kind === 'breakpoint'
                ? `@media (min-width: ${breakpoints[step.value as keyof Breakpoints]})`
                : step.value;
        css = `${wrapper}{${css}}`;
      }
      return `.${className}{${css}}`;
    })
    .join('\n');
};
