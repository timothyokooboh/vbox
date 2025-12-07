const TOKEN_PREFIX_MAP = {
  cl: 'color',
  fs: 'font-size',
  fw: 'font-weight',
  ff: 'font-family',
  lh: 'line-height',
  ls: 'letter-spacing',
  sp: 'spacing',
  rd: 'border-radius',
  z: 'z-index',
} as const;

const TOKEN_REGEX = /\b(cl|fs|fw|ff|lh|ls|sp|rd|z)-([a-zA-Z0-9-_]+)\b/g;

/**
 * Replaces prefixed tokens like `cl-red-300` with `var(--color-red-300)`.
 * Parses compound values as well: var(--font-size-xl) solid cl-red-600' => var(--font-size-xl) solid var(--color-red-600)
 */
export const parseTokens = (value: string): string => {
  if (!value || typeof value !== 'string') return value;

  return value.replace(
    TOKEN_REGEX,
    (_match, prefix, tokenKey, offset: number, fullStr: string) => {
      const category =
        TOKEN_PREFIX_MAP[prefix as keyof typeof TOKEN_PREFIX_MAP];

      /** if this specific match is inside a var(...) call, don't transform it.
       * Find the nearest "var(" before the match, and check if its closing ')' comes
       * after the end of this match.
       */
      const varStart = fullStr.lastIndexOf('var(', offset);
      if (varStart !== -1) {
        const varEnd = fullStr.indexOf(')', varStart);
        if (varEnd !== -1 && varEnd >= offset + _match.length - 1) {
          // this match is inside var(...), leave it as-is
          return _match;
        }
      }

      if (!category) return _match;

      return `var(--${category}-${tokenKey})`;
    },
  );
};
