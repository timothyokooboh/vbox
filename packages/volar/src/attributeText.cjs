const { decodeHTMLAttribute } = require('entities');

/** Decoding and source offsets travel together; entities can change string length. */
function attributeText(raw, offset = 0) {
  let content = '';
  const starts = [];
  const ends = [];
  for (let index = 0; index < raw.length; ) {
    const entity =
      raw[index] === '&'
        ? raw
            .slice(index)
            .match(/^&(?:#x[\da-f]+;?|#\d+;?|[a-z][\da-z]*;?)/i)?.[0]
        : undefined;
    const source = entity ?? raw[index];
    const decoded = entity ? decodeHTMLAttribute(entity) : source;
    for (let char = 0; char < decoded.length; char++) {
      starts.push(offset + index + (decoded === source ? char : 0));
      ends.push(
        offset + index + (decoded === source ? char + 1 : source.length),
      );
    }
    content += decoded;
    index += source.length;
  }
  return {
    content,
    rawAt: (start, end) =>
      raw.slice(
        (starts[start] ?? offset + raw.length) - offset,
        (ends[end - 1] ?? offset) - offset,
      ),
    startAt: (index) => starts[index] ?? offset + raw.length,
    endAt: (index) => ends[index - 1] ?? offset,
  };
}

function staticAttributeText(node) {
  const raw = node.loc.source;
  const quoted = raw[0] === '"' || raw[0] === "'";
  return attributeText(
    quoted ? raw.slice(1, raw.endsWith(raw[0]) ? -1 : undefined) : raw,
    node.loc.start.offset + Number(quoted),
  );
}
module.exports = { attributeText, staticAttributeText };
