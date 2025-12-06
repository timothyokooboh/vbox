const TOKEN_PREFIX_MAP = {
  cl: "color",
  fs: "font-size",
  fw: "font-weight",
  ff: "font-family",
  lh: "line-height",
  ls: "letter-spacing",
  sp: "spacing",
  rd: "border-radius",
  z: "z-index",
} as const;

const TOKEN_REGEX = /\b(cl|fs|fw|ff|lh|ls|sp|rd|z)-([a-zA-Z0-9-_]+)\b/g;

/**
 * Replaces prefixed tokens like `cl-red-300` with `var(--color-red-300)`.
 * Safely leaves already valid custom properties untouched.
 */
export const parseTokens = (value: string): string => {
  if (!value || typeof value !== "string") return value;

  return value.replace(TOKEN_REGEX, (_match, prefix, tokenKey) => {
    const category = TOKEN_PREFIX_MAP[prefix as keyof typeof TOKEN_PREFIX_MAP];

    // Safety: do not transform var(--color-red-cl-100)
    if (value.includes(`var(--`)) return _match;

    return `var(--${category}-${tokenKey})`;
  });
};
