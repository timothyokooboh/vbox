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
