/** Rename only generated identifiers; mapped text and string literals stay authored. */
function scopeCompletionCode(ts, parts, authoredSource) {
  if (!authoredSource.includes('__vbox')) return parts;
  let namespace = '__vboxEditor';
  while (authoredSource.includes(namespace)) namespace += '_';
  const text = parts
    .map((part) => (typeof part === 'string' ? part : part[0]))
    .join('');
  const ast = ts.createSourceFile(
    'completions.ts',
    text,
    ts.ScriptTarget.Latest,
    true,
  );
  const positions = [];
  function visit(node) {
    if (ts.isIdentifier(node) && node.text.startsWith('__vbox'))
      positions.push({ start: node.getStart(ast), end: node.end });
    ts.forEachChild(node, visit);
  }
  visit(ast);
  positions.sort((left, right) => left.start - right.start);
  const output = [...parts];
  let index = 0;
  let offset = 0;
  const changes = new Map();
  for (const position of positions) {
    while (
      offset +
        (typeof parts[index] === 'string'
          ? parts[index].length
          : parts[index][0].length) <=
      position.start
    ) {
      offset +=
        typeof parts[index] === 'string'
          ? parts[index].length
          : parts[index][0].length;
      index++;
    }
    if (typeof parts[index] !== 'string') continue;
    const edits = changes.get(index) ?? [];
    edits.push({ start: position.start - offset, end: position.end - offset });
    changes.set(index, edits);
  }
  for (const [index, edits] of changes) {
    for (const { start, end } of edits.reverse()) {
      output[index] =
        output[index].slice(0, start) +
        namespace +
        output[index].slice(start + '__vbox'.length, end) +
        output[index].slice(end);
    }
  }
  return output;
}

module.exports = { scopeCompletionCode };
