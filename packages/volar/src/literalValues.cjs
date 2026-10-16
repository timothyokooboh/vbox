const ts = require('typescript');
const { attributeText } = require('./attributeText.cjs');

/** Inspect literal values without evaluating the template's application code. */
function collectLiteralValues(expression) {
  const text = attributeText(
    expression.loc.source,
    expression.loc.start.offset,
  );
  const source = ts.createSourceFile(
    'vbox-preview.ts',
    `(${text.content})`,
    ts.ScriptTarget.Latest,
    true,
  );
  const values = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node)) {
      visit(node.initializer);
      return;
    }
    if (ts.isElementAccessExpression(node)) {
      visit(node.expression);
      return;
    }
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const raw = node.getText(source);
      const end =
        ts.isTemplateHead(node) || ts.isTemplateMiddle(node)
          ? 2
          : node.isUnterminated
            ? 0
            : 1;
      const start = node.getStart(source);
      values.push({
        content: raw.slice(1, end ? -end : undefined),
        startAt: (index) => text.startAt(start + index),
        endAt: (index) => text.endAt(start + index),
      });
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return values;
}

module.exports = { collectLiteralValues };
