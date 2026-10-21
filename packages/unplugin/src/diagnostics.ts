type SourcePosition = { line: number; column: number };

/** Messages use Vue's one-based columns; bundler locations use zero-based ones. */
export const createStyleError = (
  id: string,
  start: SourcePosition,
  message: string,
) =>
  Object.assign(
    new SyntaxError(`[VBox] ${id}:${start.line}:${start.column} ${message}`),
    { loc: { file: id, line: start.line, column: start.column - 1 } },
  );
