import type { Breakpoints } from '../types.js';
import type { StyleContext, StyleDeclaration } from './types.js';

/** Render matching contexts together, retaining authored declaration order. */
export const renderStyleDeclarations = (
  declarations: readonly StyleDeclaration[],
  className: string,
  breakpoints: Breakpoints,
) => {
  const blocks = new Map<string, { context: StyleContext; css: string }>();
  for (const declaration of declarations) {
    const key = JSON.stringify(declaration.context);
    const block = blocks.get(key) ?? { context: declaration.context, css: '' };
    block.css += `${declaration.property}:${declaration.value};`;
    blocks.set(key, block);
  }
  // A later base source only conflicts with base declarations, not other contexts.
  return [...blocks.values()]
    .sort((a, b) => Number(a.context.length > 0) - Number(b.context.length > 0))
    .map(({ context, css }) => {
      for (const step of [...context].reverse()) {
        const wrapper =
          step.kind === 'state'
            ? `&:${step.value}`
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
