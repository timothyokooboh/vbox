/** Vue may expose either parsed elements or transformed if/for branches. */
function* templateElements(node) {
  if (!node) return;
  if (node.type === 1 /* ELEMENT */) yield node;
  for (const child of node.branches ?? node.children ?? []) {
    yield* templateElements(child);
  }
}
module.exports = { templateElements };
