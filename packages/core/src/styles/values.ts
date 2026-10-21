import { parseTokens } from '../helpers/parseTokens.js';

const contentSyntax =
  /^(?:['"]|[a-z-][\w-]*\(|(?:initial|inherit|unset|revert(?:-layer)?|normal|none|(?:no-)?(?:open|close)-quote)\s*$)/i;

/** Bare content is text; authored CSS strings, functions and controls stay CSS. */
export const serializeStyleValue = (property: string, value: unknown) => {
  let text = String(value);
  if (property === 'content' && !contentSyntax.test(text.trim())) {
    text = `"${text.replace(/[\\"\x00-\x1f\x7f]/g, (char) => {
      if (char === '\\' || char === '"') return `\\${char}`;
      return `\\${(char.charCodeAt(0) || 0xfffd).toString(16)} `;
    })}"`;
  }
  return parseTokens(text);
};
