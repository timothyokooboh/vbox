/** Own completions only inside style ranges; keep Vue's types and semantic edits. */
function prioritizeStyleCompletions(content, hints) {
  const ranges = hints
    .map((hint) => [
      Math.max(0, hint.offset - 1),
      hint.offset + (hint.length ?? hint.mappedValue.length) + 1,
    ])
    .sort((a, b) => a[0] - b[0]);
  return content.flatMap((part) => {
    if (
      typeof part === 'string' ||
      part[1] !== 'template' ||
      !part[3].completion
    )
      return [part];
    const [text, source, offset, features] = part;
    const boundaries = new Set([0, text.length]);
    const overlaps = ranges.filter(
      ([start, end]) => start < offset + text.length && end > offset,
    );
    if (!overlaps.length) return [part];
    for (const [start, end] of overlaps) {
      boundaries.add(Math.max(0, start - offset));
      boundaries.add(Math.min(text.length, end - offset));
    }
    const points = [...boundaries].sort((a, b) => a - b);
    return points.slice(0, -1).map((start, index) => {
      const end = points[index + 1];
      const ownsRange = overlaps.some(
        ([left, right]) => offset + start >= left && offset + end <= right,
      );
      return [
        text.slice(start, end),
        source,
        offset + start,
        ownsRange ? { ...features, completion: false } : features,
      ];
    });
  });
}
module.exports = { prioritizeStyleCompletions };
