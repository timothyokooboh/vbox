import MagicString, { SourceMap, type SourceMapSegment } from 'magic-string';

type Location = { start: { offset: number }; end: { offset: number } };
const lineStarts = (text: string) => {
  const offsets = [0];
  for (let index = 0; index < text.length; index++)
    if (text[index] === '\n') offsets.push(index + 1);
  return offsets;
};
const position = (starts: number[], offset: number) => {
  let low = 0;
  let high = starts.length;
  while (low + 1 < high) {
    const middle = (low + high) >>> 1;
    if (starts[middle] > offset) high = middle;
    else low = middle;
  }
  return [low, offset - starts[low]] as const;
};

/** Vue supplies expression boundaries; keep their mappings when bindings move. */
export const createExpressionMapper = (source: string) => {
  const expressions = new Map<string, Location>();
  const bindings: Array<{ text: string; offsets: Array<[number, number]> }> =
    [];
  return {
    expression(location: Location) {
      const marker = `\0${expressions.size}\0`;
      expressions.set(marker, location);
      return marker;
    },
    binding(template: string) {
      let text = '';
      let cursor = 0;
      const offsets: Array<[number, number]> = [];
      for (const match of template.matchAll(/\0\d+\0/g)) {
        text += template.slice(cursor, match.index);
        const location = expressions.get(match[0])!;
        for (
          let index = location.start.offset;
          index < location.end.offset;
          index++
        ) {
          // Preserve authored entities. Only raw characters unsafe in our double
          // quoted attribute are expanded; all expansion columns map to that char.
          const char = source[index];
          const escaped =
            char === '"' ? '&quot;' : char === '<' ? '&lt;' : char;
          for (let column = 0; column < escaped.length; column++)
            if (char !== '\n') offsets.push([text.length + column, index]);
          text += escaped;
        }
        cursor = match.index + match[0].length;
      }
      text += template.slice(cursor);
      bindings.push({ text, offsets });
      return text;
    },
    generateMap(output: MagicString, id: string) {
      const code = output.toString();
      const map = output.generateDecodedMap({
        source: id,
        includeContent: true,
        hires: true,
      });
      const originalLines = lineStarts(source);
      const generatedLines = lineStarts(code);
      const changedLines = new Map<number, Map<number, SourceMapSegment>>();
      let cursor = 0;
      for (const binding of bindings) {
        const start = code.indexOf(binding.text, cursor);
        if (start < 0)
          throw new Error(
            '[VBox] Cannot locate generated style binding for source mapping.',
          );
        for (const [relative, original] of binding.offsets) {
          const [line, column] = position(generatedLines, start + relative);
          const [sourceLine, sourceColumn] = position(originalLines, original);
          let segments = changedLines.get(line);
          if (!segments) {
            segments = new Map(
              (map.mappings[line] ?? []).map((segment) => [
                segment[0],
                segment,
              ]),
            );
            changedLines.set(line, segments);
          }
          segments.set(column, [column, 0, sourceLine, sourceColumn]);
        }
        cursor = start + binding.text.length;
      }
      for (const [line, segments] of changedLines)
        map.mappings[line] = [...segments.values()].sort((a, b) => a[0] - b[0]);
      return new SourceMap(map);
    },
  };
};
