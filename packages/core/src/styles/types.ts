export type StyleContext = ReadonlyArray<{
  kind: 'state' | 'theme' | 'breakpoint' | 'media' | 'container' | 'selector';
  value: string;
}>;

/** Ordered declarations preserve CSS fallback and shorthand/longhand semantics. */
export type StyleDeclaration = {
  property: string;
  value: string;
  context: StyleContext;
};

export type StyleRule = { context: StyleContext; css: string };

/** A lexical style owner's ordered rule contribution, separate from applicability. */
export type StyleBundle = {
  key: string;
  ownerDepth: number;
  rules: readonly StyleRule[];
};
