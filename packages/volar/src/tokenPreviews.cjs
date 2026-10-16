const core = require('@veebox/core');
const { templateElements } = require('./templateElements.cjs');
const { staticAttributeText } = require('./attributeText.cjs');
const { collectLiteralValues } = require('./literalValues.cjs');
const { buildHoverTypes } = require('./hoverTypes.cjs');

const HOVER_FEATURES = {
  verification: false,
  completion: false,
  semantic: true,
  navigation: false,
  structure: false,
  format: false,
};

// Informational previews are independent of compiler eligibility or legacy markers.
function collectTokenHints(templateAst, resolveTokenValue) {
  const hints = [];
  function pushTokens(value) {
    for (const match of value.content.matchAll(
      /\b([a-z]{1,3}-[A-Za-z0-9_-]+)\b/g,
    )) {
      const token = match[1];
      if (!core.TokenCategories[token.split('-')[0]]) continue;
      const start = match.index;
      const end = start + token.length;
      hints.push({
        token,
        source: value.rawAt(start, end),
        resolved: resolveTokenValue(token),
        offset: value.startAt(start),
        length: value.endAt(end) - value.startAt(start),
      });
    }
  }
  for (const node of templateElements(templateAst)) {
    for (const prop of node.props) {
      if (prop.type === 6 /* ATTRIBUTE */ && prop.value) {
        pushTokens(staticAttributeText(prop.value));
      } else if (
        prop.type === 7 /* DIRECTIVE */ &&
        prop.name === 'bind' &&
        prop.exp?.type === 4
      ) {
        for (const value of collectLiteralValues(prop.exp)) pushTokens(value);
      }
    }
  }
  return hints;
}

const buildHoverCode = (hints, configFile, config, compilerOptions) => {
  const { code: out, snapshot } = buildHoverTypes(
    configFile,
    config,
    compilerOptions,
  );
  for (const hint of hints) {
    const mapped = hint.source ?? hint.token;
    const dash = hint.token.indexOf('-');
    const category = core.TokenCategories[hint.token.slice(0, dash)];
    const key = hint.token.slice(dash + 1);
    out.push(
      `({} as __vboxHoverProperty<${JSON.stringify(category)}, ${JSON.stringify(key)}, ${JSON.stringify(hint.resolved)}, {\n/** VBox token preview: ${hint.token}; ${snapshot ? 'configured snapshot (untyped config imports); refreshes on template edits' : 'configured value'}, not browser-computed. */\n${JSON.stringify(mapped)}: __vboxHoverValue<${JSON.stringify(category)}, ${JSON.stringify(key)}, ${JSON.stringify(hint.resolved)}> } >)[`,
    );
    // Match Vue's string-key boundary protocol so quotes do not extend the source span.
    const boundary = Symbol('template');
    out.push([
      '',
      'template',
      hint.offset,
      { ...HOVER_FEATURES, __combineToken: boundary },
    ]);
    out.push("'");
    out.push([mapped, 'template', hint.offset, { __combineToken: boundary }]);
    out.push("'");
    out.push([
      '',
      'template',
      hint.offset + hint.length,
      { __combineToken: boundary },
    ]);
    out.push('];\n');
  }
  return out;
};

module.exports = { collectTokenHints, buildHoverCode };
