import type { AliasMap, Breakpoints } from '@veebox/core';
import { buildCssString, parseStyleObject } from '@veebox/core';

export const resolveVBoxCss = ({
  styles,
  className,
  aliases,
  breakpoints,
}: {
  styles: Record<string, unknown>;
  className: string;
  aliases: AliasMap;
  breakpoints: Breakpoints;
}) => {
  const {
    rootStyles,
    rootDarkStyles,
    pseudoStyles,
    selectorBlocks,
    breakpointStyles,
    containerQueries,
    customMediaQueries,
  } = parseStyleObject({
    obj: styles,
    aliases,
    className,
    breakpoints,
  });

  return buildCssString({
    rootStyles,
    rootDarkStyles,
    pseudoStyles,
    selectorBlocks,
    breakpointStyles,
    containerQueries,
    customMediaQueries,
    className,
  });
};
