const core = require('@veebox/core');

/** Use the editor's TypeScript parser, including its incomplete-expression recovery. */
function collectExpressionCompletions(ts, expression, boundKey, getCandidates) {
  const prefix = '(';
  const source = ts.createSourceFile(
    'vbox-expression.ts',
    `${prefix}${expression.content})`,
    ts.ScriptTarget.Latest,
    true,
  );
  const attributes = [];
  const values = [];
  const offset = (node) =>
    expression.loc.start.offset + node.getStart(source) - prefix.length;

  function visit(node, key) {
    // Calls such as pva({ variant: 'solid' }) keep their own argument types.
    if (
      ts.isCallExpression(node) ||
      ts.isNewExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node)
    )
      return;
    if (ts.isConditionalExpression(node)) {
      visit(node.whenTrue, key);
      visit(node.whenFalse, key);
      return;
    }
    if (ts.isBinaryExpression(node)) {
      visit(node.right, key);
      return;
    }
    if (ts.isPropertyAssignment(node)) {
      const name = node.name;
      const property =
        ts.isIdentifier(name) || ts.isStringLiteral(name)
          ? name.text
          : undefined;
      if (property === undefined) return;
      attributes.push({
        objectKey: true,
        quoted: ts.isStringLiteral(name),
        value: property,
        offset: offset(name) + (ts.isStringLiteral(name) ? 1 : 0),
        length: property.length,
      });
      visit(node.initializer, property);
      return;
    }
    if (ts.isShorthandPropertyAssignment(node)) {
      attributes.push({
        objectKey: true,
        quoted: false,
        value: node.name.text,
        offset: offset(node.name),
        length: node.name.text.length,
      });
      return;
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const raw = node.getText(source);
      const value = raw.slice(1, -1);
      const start = offset(node);
      if (!/\s/.test(value)) {
        values.push({
          property: key,
          typedValue: value,
          mappedValue: value || raw,
          offset: start + (value ? 1 : 0),
          candidates: getCandidates(key),
        });
      } else {
        for (const match of value.matchAll(/\b([a-z]{1,3}-[\w-]*)/g)) {
          values.push({
            property: key,
            typedValue: match[1],
            mappedValue: match[1],
            offset: start + 1 + match.index,
            candidates: getCandidates(key),
          });
        }
      }
      return;
    }
    ts.forEachChild(node, (child) => visit(child, key));
  }
  visit(source, core.getStyleBindingKey(boundKey) ?? boundKey);
  return { attributes, values };
}

module.exports = { collectExpressionCompletions };
