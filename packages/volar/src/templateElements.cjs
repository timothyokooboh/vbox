/** Vue may expose either parsed elements or transformed if/for branches. */
function* templateElements(node, skipElement = () => false) {
  if (!node) return;
  if (node.type === 1 /* ELEMENT */) {
    if (skipElement(node)) return;
    yield node;
  }
  for (const child of node.branches ?? node.children ?? []) {
    yield* templateElements(child, skipElement);
  }
}
module.exports = { templateElements };
