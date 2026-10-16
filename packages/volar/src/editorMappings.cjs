/** Prefer VBox's targeted editor features without disabling Vue type verification. */
function prioritizeEditorMappings(content, hints, feature = 'completion') {
  const ranges = hints
    .map((hint) => [
      Math.max(0, hint.offset - (feature === 'completion' ? 1 : 0)),
      hint.offset +
        (hint.length ?? hint.mappedValue.length) +
        (feature === 'completion' ? 1 : 0),
    ])
    .sort((a, b) => a[0] - b[0]);
  return content.flatMap((part) => {
    if (typeof part === 'string' || part[1] !== 'template' || !part[3][feature])
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
        ownsRange ? { ...features, [feature]: false } : features,
      ];
    });
  });
}
module.exports = { prioritizeEditorMappings };
